function SD(basePath) {
    this.basePath = basePath;
    this.loader = new PIXI.loaders.Loader(this.basePath);
}

SD.prototype = {
    spineData : {},
    load: function(name, v, callback2) {
        if (!this.spineData[name]) {
            var skelpath = name+'.skel';
            var atlaspath = name+'.atlas';
            var texpath = name+'.png';

            this.loader.add(name+'_atlas', atlaspath, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.TEXT })
            this.loader.add(name+'_skel', skelpath, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
            this.loader.add(name+'_tex', texpath)

            this.loader.load((loader, resources) => {
                var dec = new TextDecoder("utf-8");
                var head = dec.decode(resources[name+'_skel'].data.slice(2, 10));
                var rawSkeletonData;
                if (head == "skeleton") {
                    rawSkeletonData = JSON.parse(dec.decode(resources[name+'_skel'].data));
                } else {
                    var skelBin = new SkeletonBinary();
                    skelBin.data = new Uint8Array(resources[name+'_skel'].data);
                    skelBin.initJson();

                    rawSkeletonData = skelBin.json;
                }
                console.log(rawSkeletonData);
                var rawAtlasData = resources[name+'_atlas'].data;

                var spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, function(line, callback) {
                    callback(PIXI.BaseTexture.from(name+'_tex'));
                });
                var spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
                var spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
                var skeletonData = spineJsonParser.readSkeletonData(rawSkeletonData);

                skeletonData.name = name + "_" + this.identifier + "_" + guidGenerator();
                skeletonData.icon = name;

                this.spineData[name] = skeletonData;
                v.changeCanvas(skeletonData);
                v.spine[viewer.selectedSpine].scale.set(v.scale,v.scale);
                callback2(false);
            });
        } else {
            v.changeCanvas(this.spineData[name]);
            v.spine[viewer.selectedSpine].scale.set(v.scale,v.scale);
            callback2(false);
        }
    }
}

function guidGenerator(){
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}