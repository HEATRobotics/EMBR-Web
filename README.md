# Project Documentation

## To run the project with Docker

Have Docker Desktop open, ensure you are in the root directory (`embr-web`), and run:

```bash
docker-compose up -d --build
```

> `-d`: detached mode, allows you to still access the terminal that you ran the command from

**NOTE:** Ensure that you don't have other projects running on ports 3000 (client), 3100 (server) and 3306 (MySQL).

Access the application at: http://localhost:3000

## Remaining TODO's

### Progress towards missions

- limit each bot to have maximum one mission area active
- draw a path for each bot in its mission (for example: a snake-like path)
- change simulation logic in `server/mavlinkHandler.js` to follow that path
- keep track of progress along the path (and maybe display it on the mission info tab)

### Mission statistics

- keep track of average temp based on the info fetched from useBotData hook
- determine hotspots based on last N temp readings per bot (use any sample logic like, if average of last 5 > 50 then hotspot)
