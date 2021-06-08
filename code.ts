figma.showUI(__html__);


// This is a generator that recursively produces all the nodes in subtree
// starting at the given node
function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child)
    }
  }
}

function copyTranslations() {
  let walker = walkTree(figma.currentPage.selection[0]);

  function processOnce() {
    let results = {};
    let res;
    while (!(res = walker.next()).done) {
      let node = res.value;
      // check if node is text type and contains cyrillic symbols
      if (node.type === 'TEXT' && /[а-яА-ЯЁё]/.test(node.characters)) {
        results[node.characters] = true;
      }
    }

    figma.ui.postMessage({ results: Object.keys(results) })
  }

  processOnce()
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'copy-translations') {
    copyTranslations();
  }

  if (msg.type === 'exit') {
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  }
};