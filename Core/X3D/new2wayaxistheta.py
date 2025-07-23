import asyncio
import socket
import websockets
import struct
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

# Configuration
WEBSOCKET_HOST = 'localhost'
WEBSOCKET_PORT = 8765
HTTP_HOST = 'localhost'
HTTP_PORT = 8000
UDP_IP = "127.0.0.1"
UDP_PORT_SEND = 50001
UDP_PORT_RECV = 50000

DOUBLE_COUNT = 7
FORMAT = '<7d'
FIELD_NAMES = ["axisX", "axisY", "axisZ", "theta", "bodyX", "bodyY", "bodyZ"]

connected_websockets = set()

# Create separate UDP sockets
udp_send_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_recv_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_recv_sock.bind((UDP_IP, UDP_PORT_RECV))
udp_recv_sock.setblocking(False)

async def websocket_handler(websocket):
    print(f"[WebSocket] New client connected: {websocket.remote_address}")
    connected_websockets.add(websocket)
    try:
        async for message in websocket:
            values = [float(json.loads(message).get(name, 0.0)) for name in FIELD_NAMES]
            #print(f"[WebSocket -> UDP] {values}")
            packed = struct.pack(FORMAT, *values)
            udp_send_sock.sendto(packed, (UDP_IP, UDP_PORT_SEND))
    except websockets.ConnectionClosed:
        print(f"[WebSocket] Client disconnected: {websocket.remote_address}")
    finally:
        connected_websockets.remove(websocket)

async def udp_to_websocket():
    loop = asyncio.get_event_loop()
    print(f"[UDP] Listening on {UDP_IP}:{UDP_PORT_RECV}")
    while True:
        try:
            data = await loop.sock_recv(udp_recv_sock, 8 * DOUBLE_COUNT)
            values = dict(zip(FIELD_NAMES, struct.unpack(FORMAT, data)))
            #print(f"[UDP -> WebSocket] {values}")
            if connected_websockets:
                await asyncio.gather(*[ws.send(json.dumps(values)) for ws in connected_websockets])
        except Exception as e:
            print(f"[UDP] Error: {e}")

def start_http_server():
    httpd = HTTPServer((HTTP_HOST, HTTP_PORT), SimpleHTTPRequestHandler)
    print(f"[HTTP] Server running on http://{HTTP_HOST}:{HTTP_PORT}")
    httpd.serve_forever()

async def main():
    ws_server = await websockets.serve(websocket_handler, WEBSOCKET_HOST, WEBSOCKET_PORT)
    print(f"[WebSocket] Server running on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")

    try:
        await asyncio.gather(
            ws_server.wait_closed(),
            udp_to_websocket(),
        )
    except asyncio.CancelledError:
        print("[Main] Tasks cancelled.")
    finally:
        ws_server.close()
        udp_send_sock.close()
        udp_recv_sock.close()

if __name__ == "__main__":
    # Run http server
    http_thread = threading.Thread(target=start_http_server, daemon=True)
    http_thread.start()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Shutdown] Keyboard interrupt received. Exiting...")