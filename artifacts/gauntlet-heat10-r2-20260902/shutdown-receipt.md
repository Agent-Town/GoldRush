# Heat 10 R2 shutdown receipt

- Codex streaming shim stopped after the serial field. Post-stop `GET http://127.0.0.1:8899/v1/models` failed with curl rc 7, confirming the listener was gone.
- The heat-owned Prime daemon was resolved from `/tmp/heat10-r2-prime-agent.sock` to PID 88518 and stopped by that exact PID. A follow-up socket-owner query returned none.
- Pre-existing Prime PIDs 80984 and 81066 were left running and untouched.
- Global PI and Prime configuration was never edited; only `/tmp/heat10-r2-pi-state` and `/tmp/heat10-r2-prime-state` were used.
