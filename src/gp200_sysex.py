#!/usr/bin/env python3
"""
GP-200 SYSEX tester - send and monitor SYSEX messages
Usage: python3 gp200_sysex.py
"""
import sys
import time
import threading

try:
    import rtmidi
except ImportError:
    print("Installing python-rtmidi...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-rtmidi", "--user"])
    import rtmidi

def find_gp200():
    midi_in = rtmidi.MidiIn()
    midi_out = rtmidi.MidiOut()

    in_port = None
    out_port = None

    for i, name in enumerate(midi_in.get_ports()):
        if 'GP-200' in name:
            in_port = i
            print(f"Found input: {name}")
            break

    for i, name in enumerate(midi_out.get_ports()):
        if 'GP-200' in name:
            out_port = i
            print(f"Found output: {name}")
            break

    return midi_in, midi_out, in_port, out_port

def format_sysex(data):
    """Format SYSEX as hex string"""
    return ' '.join(f'{b:02X}' for b in data)

def monitor_thread(midi_in):
    """Background thread to monitor incoming SYSEX"""
    def callback(msg, data=None):
        message, deltatime = msg
        if message[0] == 0xF0:
            print(f"\n<< RX: {format_sysex(message)}")

    midi_in.set_callback(callback)
    print("Monitoring SYSEX messages (Ctrl+C to stop)...\n")

    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        pass

def send_sysex(midi_out, data):
    """Send SYSEX message"""
    print(f">> TX: {format_sysex(data)}")
    midi_out.send_message(data)

def main():
    midi_in, midi_out, in_port, out_port = find_gp200()

    if in_port is None or out_port is None:
        print("GP-200 not found!")
        return

    midi_in.open_port(in_port)
    midi_out.open_port(out_port)

    print("\nCommands:")
    print("  patch N     - Request patch name for patch N")
    print("  monitor     - Just monitor incoming messages")
    print("  quit        - Exit")
    print()

    # Start monitoring thread
    monitor = threading.Thread(target=monitor_thread, args=(midi_in,), daemon=True)
    monitor.start()

    try:
        while True:
            cmd = input("> ").strip().lower()

            if cmd == 'quit':
                break
            elif cmd == 'monitor':
                print("Monitoring... (Ctrl+C to stop)")
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\nStopped monitoring")
            elif cmd.startswith('patch '):
                try:
                    patch_num = int(cmd.split()[1])
                    if 0 <= patch_num <= 127:
                        # Request patch name
                        msg = [0xF0, 0x21, 0x25, 0x7E, 0x47, 0x50, 0x2D, 0x32, 0x11, 0x20,
                               0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00,
                               0x00, 0x00, 0x00, 0x00, 0x00, 0x00, patch_num, 0x00, 0x00, 0x00,
                               0x07, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00, 0x00, patch_num, 0x00,
                               0x00, 0x00, patch_num, 0x00, 0x00, 0xF7]
                        send_sysex(midi_out, msg)
                    else:
                        print("Patch number must be 0-127")
                except (ValueError, IndexError):
                    print("Usage: patch N")
            else:
                print("Unknown command")

    except KeyboardInterrupt:
        print("\nExiting...")

    midi_in.close_port()
    midi_out.close_port()

if __name__ == '__main__':
    main()
