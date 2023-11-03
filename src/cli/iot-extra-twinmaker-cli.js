#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import {
  CREATE_REACT_APP_RESOURCE_LIST,
  DOWNLOAD_RESOURCE_LIST,
  createReactApp,
  download,
} from "./dist/cjs/index.js";

yargs(hideBin(process.argv))
  .command(
    "create <appName>",
    true,
    (args) => {
      args.positional("appName", {
        demandOption: true,
      });
      args.options("template", {
        alias: "t",
        choices: CREATE_REACT_APP_RESOURCE_LIST,
        default: "typescript-vite-simple",
      });
    },
    (args) => {
      createReactApp({
        appName: args.appName,
        template: args.template,
      });
    }
  )
  .command(
    "download <name>",
    true,
    (args) => {
      args.positional("name", {
        demandOption: true,
        choices: DOWNLOAD_RESOURCE_LIST,
      });
    },
    (args) => {
      download({
        name: args.name,
      });
    }
  )
  .demandCommand(1)
  .parse();
