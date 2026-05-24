import { spawnSync } from "node:child_process";

const composeArgs = process.argv.slice(2);

if (composeArgs.length === 0) {
  console.error(
    "Usage: node ./scripts/docker-compose.mjs <docker compose args>",
  );
  process.exit(1);
}

function getCommandOutput(result) {
  return [result.stdout, result.stderr, result.error?.message]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function dockerDaemonUnavailable(output) {
  return /dockerDesktopLinuxEngine|error during connect|cannot connect to the docker daemon|the system cannot find the file specified/i.test(
    output,
  );
}

function printDockerHelp(output) {
  console.error("Docker is installed, but the Docker engine is not reachable.");
  console.error("");
  console.error(
    "On Windows, this usually means Docker Desktop is not running yet.",
  );
  console.error(
    "Start Docker Desktop, wait for the engine to report as running, then rerun this command.",
  );
  console.error("");
  console.error(
    "If you already have MongoDB elsewhere, skip Docker and set MONGODB_URI in .env to that instance instead.",
  );

  if (output) {
    console.error("");
    console.error("Original Docker output:");
    console.error(output);
  }
}

const dockerInfo = spawnSync("docker", ["info"], {
  encoding: "utf8",
});

if (dockerInfo.error?.code === "ENOENT") {
  console.error("Docker was not found in PATH.");
  console.error(
    "Install Docker Desktop or point MONGODB_URI at an existing MongoDB instance.",
  );
  process.exit(1);
}

const dockerInfoOutput = getCommandOutput(dockerInfo);

if (dockerInfo.status !== 0) {
  if (dockerDaemonUnavailable(dockerInfoOutput)) {
    printDockerHelp(dockerInfoOutput);
  } else {
    console.error(dockerInfoOutput || "docker info failed.");
  }

  process.exit(dockerInfo.status ?? 1);
}

const compose = spawnSync("docker", ["compose", ...composeArgs], {
  stdio: "inherit",
});

if (compose.error?.code === "ENOENT") {
  console.error("Docker was not found in PATH.");
  console.error(
    "Install Docker Desktop or point MONGODB_URI at an existing MongoDB instance.",
  );
  process.exit(1);
}

if (compose.status !== 0) {
  const composeOutput = getCommandOutput(compose);

  if (dockerDaemonUnavailable(composeOutput)) {
    console.error("");
    printDockerHelp(composeOutput);
  }

  process.exit(compose.status ?? 1);
}
