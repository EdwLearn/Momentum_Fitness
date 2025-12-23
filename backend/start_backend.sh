#!/bin/bash
cd /home/edwlearn/v0-dashboard-de-gimnasio/backend
/home/edwlearn/v0-dashboard-de-gimnasio/momentum/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
