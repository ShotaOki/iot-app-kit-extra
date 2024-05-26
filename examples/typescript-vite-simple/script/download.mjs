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
    url: "https://threejs.org/examples/models/mmd/miku/eyeM2.bmp",
    path: "eyeM2.bmp",
  },
  {
    url: "https://threejs.org/examples/models/mmd/vmds/wavefile_v2.vmd",
    path: "wavefile_V2.vmd",
  },
  {
    url: "https://pub-5e7ce27e493044a6ad7b1d927d05320c.r2.dev/studio_apartment_vray_baked_textures_included.glb",
    path: "studio_apartment_vray_baked_textures_included.glb",
  },
];

console.log("========== START DOWNLOAD ==============");
Promise.all(
  downloadList.map((parameter) =>
    download(parameter.url, "./public/example/" + parameter.path)
  )
).then(() => {
  console.log("============ ACCEPT =============");
  console.log("");
  console.log("============ Lisence ==================");
  const log_message = [
    "URL: https://sketchfab.com/3d-models/studio-apartment-vray-baked-textures-included-cae2d96ede1d4112b1fd391099a43f77",
    '"Studio apartment (vray baked textures included)" (https://skfb.ly/WwBD) by zamorev4d is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).',
    "",
  ];
  for (let message of log_message) {
    console.log(message);
  }
});
