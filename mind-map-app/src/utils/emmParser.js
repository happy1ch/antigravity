import JSZip from 'jszip';

/**
 * Parses an ALMind (.emm) file
 * .emm is a ZIP file containing XML data
 */
export const parseEmmFile = async (file) => {
    const zip = await JSZip.loadAsync(file);
    const xmlFile = zip.file('map/maps/map1.xml');

    if (!xmlFile) {
        throw new Error('Invalid .emm file: map1.xml not found');
    }

    const xmlText = await xmlFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const nodes = [];

    const traverse = (xmlNode, parentId = null) => {
        // ALMind uses <node> elements
        if (xmlNode.nodeName === 'node') {
            const id = xmlNode.getAttribute('id') || Math.random().toString(36).substr(2, 9);
            const text = xmlNode.getAttribute('TEXT') || xmlNode.getAttribute('text') || 'Untitiled';
            const color = xmlNode.getAttribute('COLOR') || `hsl(${Math.random() * 360}, 70%, 60%)`;

            nodes.push({
                id,
                text,
                parentId,
                color
            });

            // Traverse children
            for (let i = 0; i < xmlNode.childNodes.length; i++) {
                traverse(xmlNode.childNodes[i], id);
            }
        } else {
            // If it's not a node element (like <map>), just traverse its children
            for (let i = 0; i < xmlNode.childNodes.length; i++) {
                traverse(xmlNode.childNodes[i], parentId);
            }
        }
    };

    traverse(xmlDoc.documentElement);
    return nodes;
};
