import { request } from "https";
import { createWriteStream } from "fs";

function download(uri, path) {
  return new Promise((resolve, reject) => {
    request(uri, (response) => {
      response
        .pipe(createWriteStream(path))
        .on("close", resolve)
        .on("error", reject);
    }).end();
  });
}

const downloadList = [
  {
    url: "https://threejs.org/examples/models/mmd/miku/miku_v2.pmd",
    path: "miku_v2.pmd",
  },
  {
    url: "https://threejs.org/examples/models/mmd/vmds/wavefile_v2.vmd",
    path: "wavefile_V2.vmd",
  },
];

console.log("========== START DOWNLOAD ==============");
Promise.all(
  downloadList.map((parameter) =>
    download(parameter.url, "./public/example/" + parameter.path)
  )
).then(() => {
  console.log("============ ACCEPT =============");
});
