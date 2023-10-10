---
title: タグ→動画(アトラス)の置換
author: Shota Oki
date: 2023-08-20
category: Jekyll
layout: post
---


<span class="chip-class">LIVE DEMO</span>

<div style="width: 100%; height: 400px">
  <iframe
    src="https://shotaoki.github.io/iot-app-kit-extra-document/?content=replace-tag-atrasvideo"
    width="100%"
    height="400px"
  ></iframe>
</div>

<span class="chip-class" style="margin-top: 1rem">SOURCE CODE</span>

<pre id="iframe-content-area-atrasvideo"></pre>
<script>
  fetch(
    "https://shotaoki.github.io/iot-app-kit-extra-document/document-page-contents/replace-tag-atrasvideo.txt"
  ).then((r) => {
    r.text().then((data) => {
      document.querySelector("#iframe-content-area-atrasvideo").innerHTML = data.replace("${0}", "replaceTag");
    });
  });
</script>
