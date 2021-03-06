let path = require('path');
let SourceMap = require('source-map');

function resolvePath (target, current) {
    if (path.isAbsolute(target)) {
        return path.normalize(target);
    } else {
        // Plugins like CommonJS have namespaced imports.
        let parts = target.split(':');
        let namespace = parts.length === 2? parts[0] + ':' : '';
        let file = parts.length === 2? parts[1] : parts[0];
        let ext = path.extname(file);

        return namespace + path.normalize(path.resolve(path.dirname(current), ext? file : file + '.js'));
    }
}

function isExternal (context, name) {
    if (context && context.external) {
        let external = context.external;
        if (Array.isArray(external)) {
            return external.indexOf(name) > -1;
        }

        if (typeof external === 'function') {
            return external(name);
        }
    }

    return false;
}

function formatFileName (context, fileName, pattern) {
    let name = path.basename(fileName).replace(path.extname(fileName), '');

    return pattern.replace('[name]', name)
        .replace('[extname]', path.extname(fileName))
        .replace('[ext]', path.extname(fileName).substring(1))
        .replace('[format]', context.output.format === 'es'? 'esm' : context.output.format);
}

function getNameFromFileName (file) {
    return path.basename(file).replace(path.extname(file), '')
}

function combineSourceMapChain (mapChain, original_code, filepath) {
    // TODO: Proper handling of null maps.
    let map;
    mapChain = mapChain.filter(o => o.map && o.map.mappings).reverse();

    if (mapChain.length > 1) {
        mapChain.forEach((obj, index) => {
            obj.version = 3;
            obj.map.file = filepath + '_' + index;
            // Check is in place because some transforms return sources, in particular multi-file sources.
            obj.map.sources = obj.map.sources.length === 1? [filepath + '_' + (index + 1)] : obj.map.sources;
            if(obj.map.sourcesContent && obj.map.sourcesContent.length === 1) {
                obj.map.sourcesContent = [mapChain[index + 1] ? mapChain[index + 1].code : original_code]
            }
        });

        let mapGenerator = SourceMap.SourceMapGenerator.fromSourceMap(new SourceMap.SourceMapConsumer(mapChain[0].map));

        for (let i = 1; i < mapChain.length; i++) {
            mapGenerator.applySourceMap(new SourceMap.SourceMapConsumer(mapChain[i].map))
        }

        map = mapGenerator.toJSON();

        // Remove irrelevant maps.
        map.sources = map.sources && map.sources.map((s, i) => i !== map.sources.length - 1? '' : s);
        map.sourcesContent = map.sourcesContent && map.sourcesContent.map((s, i) => i !== map.sourcesContent.length - 1? '' : s);
    } else {
        map = mapChain.length > 0? mapChain[0].map : undefined;
    }   

    if (map) {
        map.file = filepath;
        map.sources = [filepath];
        map.sourcesContent = [original_code];
    }
    

    return map;
}

function applyOutputFileNames (context, bundle) {
    let name_map = {};

    bundle.forEach(curr => {
        if (!name_map[curr.name]) {
            name_map[curr.name] = [];
        }

        name_map[curr.name].push(curr);
    });

    Object.keys(name_map).forEach(name => {
        let entries = name_map[name];
        entries.forEach((entry, index) => {
            let name = entry.name + (index > 0? (index + 1) : '');

            if (entry.isEntry && !entry.referenceId) {
                if (context.output.file) {
                    entry.fileName = path.basename(context.output.file);
                } else {
                    entry.fileName = formatFileName(context, name + '.js', context.output.entryFileNames);
                }
            }

            if (entry.isDynamicEntry || entry.referenceId) {
                entry.fileName = entry.fileName || formatFileName(context, name + '.js', context.output.chunkFileNames);
            }
        });
    });
}

function emitAssetToBundle (context, bundle, asset) {
    let extensionlessName = getNameFromFileName(asset.name);
    let extension = path.extname(asset.name);
    let deconflictMatcher = new RegExp('^' + extensionlessName + '(\\d+)?' + extension + '$');
    let matches = bundle.filter(e => e.isAsset && e.name.match(deconflictMatcher));
    let finalisedName = extensionlessName + (matches.length > 0? matches.length + 1 : '') + extension;

    bundle.push({
        referenceId: asset.referenceId,
        name: finalisedName,
        isAsset: true,
        type: 'asset',
        source: asset.source,
        fileName: asset.fileName || formatFileName(context, finalisedName, context.output.assetFileNames)
    });
}

module.exports = {
    resolvePath,
    isExternal,
    formatFileName,
    getNameFromFileName,
    combineSourceMapChain,
    applyOutputFileNames,
    emitAssetToBundle,
};