import sys
import os
import math
import json
import cv2
import numpy as np

# Optional GUI file picker
try:
    import tkinter as tk
    from tkinter import filedialog
    HAS_TK = True
except ImportError:
    HAS_TK = False


class PlayerTrackerApp:
    def __init__(self, video_path=None):
        self.video_path = video_path
        self.cap = None
        self.total_frames = 0
        self.fps = 30.0
        self.width = 0
        self.height = 0

        # Multi-Tracker List: each element is a dict:
        # { 'id': int, 'center': (cx, cy), 'radius': int, 'color': (b, g, r), 'name': str,
        #   'cv_tracker': cv2.TrackerCSRT, 'keyframes': {frame_idx: (cx, cy)} }
        self.trackers = []
        self.selected_tracker_idx = -1
        self.rotation_angle = 0.0
        self.rotation_speed = 1.0  # Kept present smooth broadcast rotation speed
        self.line_thickness = 5    # Thicker width 4-dash lines

        # Feature Toggles
        self.dimension_mode = '3D' # '2D' or '3D'
        self.show_line = True
        self.show_ruler = True
        self.show_spotlight = True
        self.show_tools_hud = True
        self.is_fullscreen = False
        self.pixels_per_meter = 17.2

        # Color presets (BGR for OpenCV)
        self.colors = [
            (255, 240, 0),    # Neon Cyan (B=255, G=240, R=0)
            (0, 214, 255),    # Broadcast Yellow (B=0, G=214, R=255)
            (255, 255, 255),  # Clean White
            (85, 42, 255),    # Crimson / Red
            (118, 230, 0),    # Pitch Green
            (255, 136, 179)   # Electric Purple
        ]
        self.color_idx = 0

        # Playback speed options: 0.25x, 0.5x, 1.0x, 1.5x, 2.0x
        self.speeds = [0.25, 0.5, 1.0, 1.5, 2.0]
        self.speed_idx = 2  # default 1.0x

        # Playback control
        self.is_playing = False
        self.current_frame_idx = 0
        self.current_frame = None

        # Window & UI
        self.window_name = "Tactical Multi-Player Tracker (Broadcast Vision)"
        self.scale = 1.0

    def select_video_file(self):
        if self.video_path and os.path.isfile(self.video_path):
            return self.video_path

        if HAS_TK:
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            selected = filedialog.askopenfilename(
                title="Select Drone or Match Video",
                filetypes=[
                    ("Video Files", "*.mp4 *.mov *.avi *.mkv *.webm *.m4v"),
                    ("All Files", "*.*")
                ]
            )
            root.destroy()
            if selected and os.path.isfile(selected):
                return selected

        return None

    def open_video(self):
        path = self.select_video_file()
        if not path:
            print("No video file selected. Launching tactical Back-4 match simulation...")
            self.cap = None
            self.total_frames = 600
            self.fps = 30.0
            self.width = 1280
            self.height = 720
            return False

        self.video_path = path
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            print(f"Error: Could not open video file {self.video_path}")
            return False

        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"Loaded match video: {os.path.basename(self.video_path)}")
        print(f"Resolution: {self.width}x{self.height} | Total Frames: {self.total_frames} | FPS: {self.fps:.1f}")
        return True

    def add_tracker_at(self, cx, cy, start_frame=None, end_frame=None):
        """
        Adds a new player tracker at (cx, cy) with 4-dash ring.
        Supports continuous keyframing when shifted across frames.
        """
        idx = len(self.trackers) + 1
        default_names = ["LB", "CB", "CB", "RB", "DM", "RW", "ST", "LW"]
        name = default_names[idx - 1] if idx <= len(default_names) else f"P{idx}"

        r = 34
        start_frame = self.current_frame_idx if start_frame is None else start_frame
        end_frame = min(self.total_frames - 1, start_frame + int(self.fps * 5.0)) if end_frame is None else end_frame

        tracker_obj = {
            'id': idx,
            'name': name,
            'center': (float(cx), float(cy)),
            'radius': r,
            'color': self.colors[self.color_idx % len(self.colors)],
            'start_frame': start_frame,
            'end_frame': end_frame,
            'keyframes': {self.current_frame_idx: (float(cx), float(cy))}
        }

        # If OpenCV frame is available, optionally initialize CSRT
        if self.current_frame is not None:
            x = max(0, int(cx - r))
            y = max(0, int(cy - r))
            w = min(self.width - x, int(r * 2))
            h = min(self.height - y, int(r * 2))
            try:
                cv_tracker = cv2.TrackerCSRT_create()
                cv_tracker.init(self.current_frame, (x, y, w, h))
                tracker_obj['cv_tracker'] = cv_tracker
            except Exception:
                tracker_obj['cv_tracker'] = None
        else:
            tracker_obj['cv_tracker'] = None

        self.trackers.append(tracker_obj)
        self.selected_tracker_idx = len(self.trackers) - 1
        print(f"[Tracker Added] #{idx} ({name}) at ({cx}, {cy}) | Frames: {start_frame}->{end_frame}")

    def get_tracker_position(self, tr, frame_idx):
        """
        Resolves continuous tracker position across frames using keyframe interpolation.
        Returns None if frame_idx is outside active timeframe [start_frame, end_frame].
        """
        if 'start_frame' in tr and frame_idx < tr['start_frame']:
            return None
        if 'end_frame' in tr and frame_idx > tr['end_frame']:
            return None

        kfs = tr['keyframes']
        if not kfs:
            return tr['center']
        if frame_idx in kfs:
            return kfs[frame_idx]

        sorted_frames = sorted(kfs.keys())
        if frame_idx <= sorted_frames[0]:
            return kfs[sorted_frames[0]]
        if frame_idx >= sorted_frames[-1]:
            return kfs[sorted_frames[-1]]

        # Interpolate between bounding frames
        for i in range(len(sorted_frames) - 1):
            f1, f2 = sorted_frames[i], sorted_frames[i + 1]
            if f1 <= frame_idx <= f2:
                span = f2 - f1
                ratio = (frame_idx - f1) / float(span) if span > 0 else 0
                p1, p2 = kfs[f1], kfs[f2]
                return (p1[0] + (p2[0] - p1[0]) * ratio, p1[1] + (p2[1] - p1[1]) * ratio)

        return tr['center']

    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            fx = int(x / self.scale)
            fy = int(y / self.scale)

            # Check if clicked near an existing tracker to select or move it
            clicked_idx = -1
            cur_pos_list = [self.get_tracker_position(t, self.current_frame_idx) for t in self.trackers]
            for i, pos in enumerate(cur_pos_list):
                dist = math.hypot(fx - pos[0], fy - pos[1])
                if dist <= self.trackers[i]['radius'] + 10:
                    clicked_idx = i
                    break

            if clicked_idx != -1:
                self.selected_tracker_idx = clicked_idx
                print(f"[Selected Tracker] #{self.trackers[clicked_idx]['id']} ({self.trackers[clicked_idx]['name']})")
            else:
                self.add_tracker_at(fx, fy)

        elif event == cv2.EVENT_RBUTTONDOWN:
            # Shift selected tracker keyframe at this frame (Manual continuous tracking)
            if 0 <= self.selected_tracker_idx < len(self.trackers):
                fx = int(x / self.scale)
                fy = int(y / self.scale)
                tr = self.trackers[self.selected_tracker_idx]
                tr['keyframes'][self.current_frame_idx] = (float(fx), float(fy))
                tr['center'] = (float(fx), float(fy))
                print(f"[Keyframe Shifted] #{tr['id']} ({tr['name']}) -> ({fx}, {fy}) at frame {self.current_frame_idx}")

    def draw_four_dash_tracker(self, frame, cx, cy, radius, angle_deg, color, thickness, dim_mode, name, is_selected):
        """
        Renders exactly 4 thick dash lines in a circle form, rotating around its axis.
        Supports 2D circular ring and 3D ground-projected perspective ellipse with tactical vertical stem.
        """
        num_dashes = 4
        dash_span = 360.0 / num_dashes  # 90 degrees
        dash_arc = dash_span * 0.62      # 56 degrees arc, 34 degrees gap

        if dim_mode == '3D':
            ground_y = int(cy + 18)
            rx = int(radius * 1.15)
            ry = int(radius * 0.44)

            # Vertical tactical stem
            cv2.line(frame, (int(cx), ground_y), (int(cx), int(cy - 6)), color, 1, cv2.LINE_AA)

            # 4 Thicker Dashes on Ground Ellipse
            for i in range(num_dashes):
                start_angle = (angle_deg + i * dash_span) % 360.0
                end_angle = (start_angle + dash_arc) % 360.0
                cv2.ellipse(frame, (int(cx), ground_y), (rx, ry), 0, start_angle, end_angle, color, thickness, lineType=cv2.LINE_AA)

            # Ground Center Pinpoint
            cv2.circle(frame, (int(cx), ground_y), 3, color, -1, lineType=cv2.LINE_AA)
            # Upper reticle
            cv2.circle(frame, (int(cx), int(cy - 6)), 3, (255, 255, 255) if is_selected else color, -1, lineType=cv2.LINE_AA)

            # Name Label Badge at the bottom on the ground below the ellipse
            label_y = int(ground_y + ry + 12)
        else:
            # 2D Planar Mode
            for i in range(num_dashes):
                start_angle = (angle_deg + i * dash_span) % 360.0
                end_angle = (start_angle + dash_arc) % 360.0
                cv2.ellipse(frame, (int(cx), int(cy)), (int(radius), int(radius)), 0, start_angle, end_angle, color, thickness, lineType=cv2.LINE_AA)

            # Center pinpoint
            cv2.circle(frame, (int(cx), int(cy)), 3, color, -1, lineType=cv2.LINE_AA)
            label_y = int(cy + radius + 12)

        # Draw Player Name / Role Tag (e.g. "LB") on the ground, leaving player body clear
        if name:
            (tw, th), baseline = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            tx = int(cx - tw / 2)
            cv2.rectangle(frame, (tx - 5, label_y - th - 3), (tx + tw + 5, label_y + 4), (10, 15, 26), -1)
            cv2.rectangle(frame, (tx - 5, label_y - th - 3), (tx + tw + 5, label_y + 4), (255, 255, 255) if is_selected else color, 1, cv2.LINE_AA)
            cv2.putText(frame, name, (tx, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

    def draw_spotlight(self, frame, cx, cy, color):
        """
        Renders a broadcast tactical spotlight cone highlighting the player.
        """
        ground_y = int(cy + 18)
        overlay = frame.copy()
        pts = np.array([
            [int(cx - 14), max(0, ground_y - 180)],
            [int(cx + 14), max(0, ground_y - 180)],
            [int(cx + 42), ground_y],
            [int(cx - 42), ground_y]
        ], np.int32)
        cv2.fillPoly(overlay, [pts], color)
        cv2.ellipse(overlay, (int(cx), ground_y), (42, 16), 0, 0, 360, color, -1)
        cv2.addWeighted(overlay, 0.22, frame, 0.78, 0, frame)

    def draw_connecting_lines_and_rulers(self, frame, positions):
        """
        Connects multiple players with tactical lines and displays measured pitch ruler distances.
        """
        if len(positions) < 2:
            return

        for i in range(len(positions) - 1):
            p1 = positions[i]
            p2 = positions[i + 1]

            if self.show_line:
                cv2.line(frame, (int(p1[0]), int(p1[1])), (int(p2[0]), int(p2[1])), (255, 240, 0), 2, cv2.LINE_AA)

            if self.show_ruler:
                dist_px = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
                dist_meters = dist_px / max(1.0, self.pixels_per_meter)
                mid_x = int((p1[0] + p2[0]) / 2)
                mid_y = int((p1[1] + p2[1]) / 2)

                text = f"{dist_meters:.1f}m"
                cv2.rectangle(frame, (mid_x - 22, mid_y - 12), (mid_x + 22, mid_y + 8), (10, 15, 25), -1)
                cv2.rectangle(frame, (mid_x - 22, mid_y - 12), (mid_x + 22, mid_y + 8), (0, 230, 118), 1)
                cv2.putText(frame, text, (mid_x - 18, mid_y + 3), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 230, 118), 1, cv2.LINE_AA)

    def generate_demo_frame(self, frame_idx):
        t = frame_idx / self.fps
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)

        # Grass field
        frame[:] = (20, 48, 16)  # Dark green BGR

        # Pitch markings
        cv2.rectangle(frame, (50, 40), (1230, 680), (180, 200, 180), 2, cv2.LINE_AA)
        cv2.line(frame, (640, 40), (640, 680), (180, 200, 180), 2, cv2.LINE_AA)
        cv2.ellipse(frame, (640, 360), (100, 70), 0, 0, 360, (180, 200, 180), 2, cv2.LINE_AA)

        # Shift Back 4
        shift_x = math.sin(t * 0.6) * 110
        shift_y = math.cos(t * 0.6) * 45

        # Back 4 Players
        b4_pts = [
            (int(330 + shift_x), int(510 + shift_y)),
            (int(490 + shift_x), int(470 + shift_y)),
            (int(670 + shift_x), int(460 + shift_y)),
            (int(850 + shift_x), int(490 + shift_y))
        ]

        for pt in b4_pts:
            cv2.circle(frame, pt, 20, (240, 210, 0), -1, cv2.LINE_AA)
            cv2.circle(frame, pt, 20, (255, 255, 255), 2, cv2.LINE_AA)

        # Opponent Striker
        s_x = int(570 + math.sin(t * 0.9) * 220)
        s_y = int(320 + math.cos(t * 0.9) * 70)
        cv2.circle(frame, (s_x, s_y), 20, (50, 40, 230), -1, cv2.LINE_AA)
        cv2.circle(frame, (s_x, s_y), 20, (255, 255, 255), 2, cv2.LINE_AA)

        # Ball
        ball_x = int(s_x + 45 + math.sin(t * 2.5) * 15)
        ball_y = int(s_y + 30 + math.cos(t * 2.5) * 10)
        cv2.circle(frame, (ball_x, ball_y), 8, (255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(frame, (ball_x, ball_y), 8, (0, 0, 0), 1, cv2.LINE_AA)

        return frame

    def read_frame(self, frame_idx):
        if self.cap is not None:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = self.cap.read()
            if not ret:
                return None
            return frame
        else:
            return self.generate_demo_frame(frame_idx)

    def run(self):
        has_video = self.open_video()

        cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(self.window_name, min(1280, self.width or 1280), min(720, self.height or 720))
        cv2.setMouseCallback(self.window_name, self.mouse_callback)

        def on_trackbar(val):
            self.current_frame_idx = val
            frame = self.read_frame(self.current_frame_idx)
            if frame is not None:
                self.current_frame = frame

        cv2.createTrackbar("Timeline", self.window_name, 0, max(1, self.total_frames - 1), on_trackbar)

        self.is_playing = True
        self.current_frame = self.read_frame(0)

        # Pre-seed demo Back 4 if demo simulation (full match duration)
        if not has_video:
            full_end = max(1, self.total_frames - 1)
            self.add_tracker_at(330, 510, start_frame=0, end_frame=full_end)
            self.add_tracker_at(490, 470, start_frame=0, end_frame=full_end)
            self.add_tracker_at(670, 460, start_frame=0, end_frame=full_end)
            self.add_tracker_at(850, 490, start_frame=0, end_frame=full_end)

        # Terminal Quick Guide
        print("\n" + "="*65)
        print(" BROADCAST TACTICAL MULTI-PLAYER TRACKER - ACTIVE")
        print("="*65)
        print(" • LEFT CLICK  : Add Tracker / Select Tracker")
        print(" • RIGHT CLICK : Shift Selected Tracker (Saves Continuous Keyframe)")
        print(" • SPACE       : Play / Pause")
        print(" • LEFT / RIGHT: Step 1 Frame Back / Forward")
        print(" • [ / ]       : Step 0.5s Back / Forward")
        print(" • < / >       : Step 2.0s Back / Forward")
        print(" • 2 / 3       : Toggle 2D Planar vs 3D Ground Perspective")
        print(" • L           : Toggle Connecting Line (ON/OFF)")
        print(" • U           : Toggle Ruler Distance (ON/OFF)")
        print(" • S           : Toggle Spotlight (ON/OFF)")
        print(" • C           : Cycle Colors (Cyan, Yellow, White, Red, Green)")
        print(" • I / J       : Import JSON File (Load tactical trackers)")
        print(" • K           : Export JSON File (Save tactical trackers)")
        print(" • X           : Delete Selected Tracker | R: Reset All")
        print(" • Q / ESC     : Quit")
        print("="*65 + "\n")

        while True:
            # Advance frame if playing
            if self.is_playing:
                self.current_frame_idx += 1
                if self.current_frame_idx >= self.total_frames:
                    self.current_frame_idx = 0
                frame = self.read_frame(self.current_frame_idx)
                if frame is not None:
                    self.current_frame = frame
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)

            if self.current_frame is None:
                break

            display_frame = self.current_frame.copy()
            self.rotation_angle = (self.rotation_angle + self.rotation_speed) % 360.0

            # Gather resolved positions for all trackers at current frame
            positions = []
            for tr in self.trackers:
                pos = self.get_tracker_position(tr, self.current_frame_idx)
                positions.append(pos)

            # Filter active trackers at current frame
            active_data = [(pos, tr, i) for i, (pos, tr) in enumerate(zip(positions, self.trackers)) if pos is not None]
            active_positions = [d[0] for d in active_data]

            # Draw Spotlight Layer
            if self.show_spotlight:
                for pos, tr, _ in active_data:
                    self.draw_spotlight(display_frame, pos[0], pos[1], tr['color'])

            # Draw Connecting Lines and Ruler
            self.draw_connecting_lines_and_rulers(display_frame, active_positions)

            # Draw 4-Dash Rotating Rings for each active tracker
            for pos, tr, i in active_data:
                is_selected = (i == self.selected_tracker_idx)
                self.draw_four_dash_tracker(
                    display_frame,
                    pos[0],
                    pos[1],
                    tr['radius'],
                    self.rotation_angle,
                    tr['color'],
                    self.line_thickness,
                    self.dimension_mode,
                    tr['name'],
                    is_selected
                )

            # Status and Speed HUD Overlay
            if self.show_tools_hud:
                current_spd = self.speeds[self.speed_idx]
                hud_text = f"Speed: {current_spd}x (V) | {self.dimension_mode} | T/H: Hide Tools | F: Fullscreen | I/J: Import JSON | K: Export JSON | E: MP4"
                cv2.putText(display_frame, hud_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3, cv2.LINE_AA)
                cv2.putText(display_frame, hud_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 240, 255), 1, cv2.LINE_AA)

            cv2.imshow(self.window_name, display_frame)

            current_spd = self.speeds[self.speed_idx]
            effective_fps = self.fps * current_spd
            wait_ms = max(1, int(1000.0 / effective_fps)) if self.is_playing else 30
            key = cv2.waitKey(wait_ms) & 0xFF

            if key in (27, ord('q'), ord('Q')):
                break
            elif key == 32:  # SPACE
                self.is_playing = not self.is_playing
            elif key in (ord('f'), ord('F')):
                self.is_fullscreen = not self.is_fullscreen
                prop_val = cv2.WINDOW_FULLSCREEN if self.is_fullscreen else cv2.WINDOW_NORMAL
                cv2.setWindowProperty(self.window_name, cv2.WND_PROP_FULLSCREEN, prop_val)
                print(f"[Display] {'FULLSCREEN' if self.is_fullscreen else 'WINDOWED'} (Press F to toggle)")
            elif key in (ord('t'), ord('T'), ord('h'), ord('H')):
                self.show_tools_hud = not self.show_tools_hud
                print(f"[Tools HUD] {'VISIBLE' if self.show_tools_hud else 'HIDDEN'} (Press T/H to toggle)")
            elif key in (ord('v'), ord('V')):
                self.speed_idx = (self.speed_idx + 1) % len(self.speeds)
                print(f"[Speed] Playback speed set to: {self.speeds[self.speed_idx]}x")
            elif key in (ord('e'), ord('E')):
                self.export_mp4()
            elif key in (ord('i'), ord('I'), ord('j'), ord('J')):
                self.import_json()
            elif key in (ord('k'), ord('K')):
                self.export_json()
            elif key in (ord('d'), ord('D'), 83):  # 0.5s forward (Default Right Arrow)
                self.is_playing = False
                self.current_frame_idx = min(self.total_frames - 1, self.current_frame_idx + int(self.fps * 0.5))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key in (ord('a'), ord('A'), 81):  # 0.5s back (Default Left Arrow)
                self.is_playing = False
                self.current_frame_idx = max(0, self.current_frame_idx - int(self.fps * 0.5))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord('.'):  # 1 Frame forward
                self.is_playing = False
                self.current_frame_idx = min(self.total_frames - 1, self.current_frame_idx + 1)
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord(','):  # 1 Frame back
                self.is_playing = False
                self.current_frame_idx = max(0, self.current_frame_idx - 1)
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord(']'):  # 0.5s forward
                self.is_playing = False
                self.current_frame_idx = min(self.total_frames - 1, self.current_frame_idx + int(self.fps * 0.5))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord('['):  # 0.5s back
                self.is_playing = False
                self.current_frame_idx = max(0, self.current_frame_idx - int(self.fps * 0.5))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord('>'):  # 2.0s forward
                self.is_playing = False
                self.current_frame_idx = min(self.total_frames - 1, self.current_frame_idx + int(self.fps * 2.0))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord('<'):  # 2.0s back
                self.is_playing = False
                self.current_frame_idx = max(0, self.current_frame_idx - int(self.fps * 2.0))
                self.current_frame = self.read_frame(self.current_frame_idx)
                cv2.setTrackbarPos("Timeline", self.window_name, self.current_frame_idx)
            elif key == ord('2'):
                self.dimension_mode = '2D'
                print("[Mode] 2D Planar")
            elif key == ord('3'):
                self.dimension_mode = '3D'
                print("[Mode] 3D Ground Perspective")
            elif key in (ord('l'), ord('L')):
                self.show_line = not self.show_line
                print(f"[Line] {'ON' if self.show_line else 'OFF'}")
            elif key in (ord('u'), ord('U')):
                self.show_ruler = not self.show_ruler
                print(f"[Ruler] {'ON' if self.show_ruler else 'OFF'}")
            elif key in (ord('s'), ord('S')):
                self.show_spotlight = not self.show_spotlight
                print(f"[Spotlight] {'ON' if self.show_spotlight else 'OFF'}")
            elif key in (ord('c'), ord('C')):
                self.color_idx = (self.color_idx + 1) % len(self.colors)
                if 0 <= self.selected_tracker_idx < len(self.trackers):
                    self.trackers[self.selected_tracker_idx]['color'] = self.colors[self.color_idx]
            elif key in (ord('x'), ord('X')):
                if 0 <= self.selected_tracker_idx < len(self.trackers):
                    del self.trackers[self.selected_tracker_idx]
                    self.selected_tracker_idx = max(0, len(self.trackers) - 1)
                    print("[Tracker] Deleted.")
            elif key in (ord('r'), ord('R')):
                self.trackers = []
                self.selected_tracker_idx = -1
                print("[Trackers] All cleared.")

    def export_json(self, json_path=None):
        """Exports tactical trackers and keyframes to a JSON file."""
        if not json_path:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(script_dir, f"tactical_trackers_{int(self.current_frame_idx)}.json")

        trackers_data = []
        for tr in self.trackers:
            kfs = []
            for f_idx, pos in sorted(tr.get('keyframes', {}).items()):
                kfs.append({
                    "frame": f_idx,
                    "time": round(f_idx / self.fps, 2),
                    "x": float(pos[0]),
                    "y": float(pos[1])
                })
            trackers_data.append({
                "id": tr.get("id"),
                "name": tr.get("name"),
                "color": list(tr.get("color", [255, 240, 0])),
                "radius": tr.get("radius", 34),
                "start_frame": tr.get("start_frame", 0),
                "end_frame": tr.get("end_frame", self.total_frames - 1),
                "keyframes": kfs
            })

        data = {
            "version": "1.1",
            "fps": self.fps,
            "width": self.width or 1280,
            "height": self.height or 720,
            "total_frames": self.total_frames,
            "current_frame": self.current_frame_idx,
            "dimensionMode": self.dimension_mode,
            "trackers": trackers_data
        }

        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f"[JSON Export] Successfully saved {len(trackers_data)} trackers to: {json_path}")
        except Exception as e:
            print(f"[JSON Export Error] Failed to write JSON: {e}")

    def import_json(self, json_path=None):
        """Imports tactical trackers from a JSON file."""
        if not json_path and HAS_TK:
            try:
                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                json_path = filedialog.askopenfilename(
                    title="Select Tactical Trackers JSON File",
                    filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")]
                )
                root.destroy()
            except Exception as e:
                print(f"[JSON Import Dialog Error]: {e}")
                json_path = None

        if not json_path:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            default_path = os.path.join(script_dir, "tactical_trackers.json")
            if os.path.isfile(default_path):
                json_path = default_path
            else:
                print("[JSON Import] No JSON file selected.")
                return False

        if not os.path.isfile(json_path):
            print(f"[JSON Import] File not found: {json_path}")
            return False

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            raw_trackers = data if isinstance(data, list) else data.get("trackers", [])
            if not raw_trackers:
                print(f"[JSON Import] No trackers found in {json_path}")
                return False

            if isinstance(data, dict) and "dimensionMode" in data:
                self.dimension_mode = data["dimensionMode"]

            new_trackers = []
            for idx, rt in enumerate(raw_trackers):
                t_id = rt.get("id", idx + 1)
                name = rt.get("name", f"P{idx + 1}")
                color = rt.get("color", self.colors[idx % len(self.colors)])

                if isinstance(color, str) and color.startswith("#"):
                    h = color.lstrip('#')
                    rgb = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
                    color = (rgb[2], rgb[1], rgb[0])
                elif isinstance(color, list):
                    color = tuple(color)

                radius = rt.get("radius", 34)
                start_frame = rt.get("start_frame", int(rt.get("startTime", 0) * self.fps))
                end_frame = rt.get("end_frame", int(rt.get("endTime", (self.total_frames - 1) / self.fps) * self.fps))

                keyframes = {}
                raw_kfs = rt.get("keyframes", [])
                if isinstance(raw_kfs, list):
                    for kf in raw_kfs:
                        f_idx = kf.get("frame")
                        if f_idx is None:
                            f_idx = int(kf.get("time", 0) * self.fps)
                        x = kf.get("x", 0)
                        y = kf.get("y", 0)
                        keyframes[int(f_idx)] = (float(x), float(y))
                elif isinstance(raw_kfs, dict):
                    for k, val in raw_kfs.items():
                        keyframes[int(k)] = (float(val[0]), float(val[1]))

                center = next(iter(keyframes.values())) if keyframes else (self.width // 2, self.height // 2)

                new_trackers.append({
                    'id': t_id,
                    'name': name,
                    'center': center,
                    'radius': radius,
                    'color': color,
                    'start_frame': start_frame,
                    'end_frame': end_frame,
                    'keyframes': keyframes,
                    'cv_tracker': None
                })

            self.trackers = new_trackers
            self.selected_tracker_idx = 0 if self.trackers else -1
            print(f"[JSON Import] Successfully imported {len(self.trackers)} trackers from: {os.path.basename(json_path)}")
            return True
        except Exception as e:
            print(f"[JSON Import Error] Failed to read JSON file: {e}")
            return False

    def export_mp4(self, output_filename="tactical_analysis.mp4", duration_frames=120):
        print(f"\n[Export] Rendering tactical clip to {output_filename}...")
        w = self.width or 1280
        h = self.height or 720
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_filename, fourcc, self.fps, (w, h))

        rot = 0.0
        start_frame = self.current_frame_idx
        for f in range(duration_frames):
            frame_idx = (start_frame + f) % self.total_frames
            base_frame = self.read_frame(frame_idx)
            if base_frame is None:
                break
            export_frame = base_frame.copy()
            rot = (rot + self.rotation_speed) % 360.0

            pos_list = [self.get_tracker_position(tr, frame_idx) for tr in self.trackers]
            if self.show_spotlight:
                for pos, tr in zip(pos_list, self.trackers):
                    self.draw_spotlight(export_frame, pos[0], pos[1], tr['color'])
            self.draw_connecting_lines_and_rulers(export_frame, pos_list)
            for i, (pos, tr) in enumerate(zip(pos_list, self.trackers)):
                self.draw_four_dash_tracker(
                    export_frame, pos[0], pos[1], tr['radius'], rot,
                    tr['color'], self.line_thickness, self.dimension_mode, tr['name'], False
                )
            out.write(export_frame)

        out.release()
        print(f"[Export] Saved MP4 video successfully: {output_filename}")

        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    video_arg = sys.argv[1] if len(sys.argv) > 1 else None
    app = PlayerTrackerApp(video_arg)
    app.run()
