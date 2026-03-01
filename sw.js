document.getElementById("zipUpload").addEventListener("change", async function(e){
    let file = e.target.files[0];
    if(!file) return;

    // Show loading bar
    const loadingBar = document.getElementById("loadingBar");
    const loadingFill = document.getElementById("loadingFill");
    loadingBar.style.display = "block";
    loadingFill.style.width = "0%";

    let zip = await JSZip.loadAsync(file);
    let name = file.name.replace(".zip","");
    library[name] = { chapters: [], cover: null };

    let chapters = {};
    zip.forEach((path, f) => {
        if(!f.dir){
            let parts = path.split("/");
            let chap = parts[0];
            if(!chapters[chap]) chapters[chap] = [];
            chapters[chap].push(f);
        }
    });

    let sorted = Object.keys(chapters).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));

    let totalImages = 0;
    sorted.forEach(chap=>totalImages += chapters[chap].length);
    let processed = 0;

    for(let chap of sorted){
        let imgs = [];
        let files = chapters[chap].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
        for(let f of files){
            let blob = await f.async("blob");
            let url = URL.createObjectURL(blob);
            imgs.push(url);

            // Update loading progress
            processed++;
            loadingFill.style.width = ((processed/totalImages)*100)+"%";
        }
        library[name].chapters.push(imgs);
    }

    library[name].cover = library[name].chapters[0][0]; // auto thumbnail
    save();
    renderLibrary();

    // Hide loading bar
    loadingBar.style.display = "none";
});
