/**
 * Remark plugin: converts GitHub/Obsidian-style callout blockquotes
 *   > [!NOTE] Optional Title
 *   > Body text...
 * into semantic <aside class="callout callout-note"> blocks matching DESIGN.md.
 */
export default function remarkCallouts() {
  return (tree) => {
    const visit = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'blockquote' && Array.isArray(child.children) && child.children.length > 0) {
          const firstPara = child.children[0];
          if (firstPara?.type === 'paragraph' && Array.isArray(firstPara.children) && firstPara.children.length > 0) {
            const firstText = firstPara.children[0];
            if (firstText?.type === 'text' && typeof firstText.value === 'string') {
              const m = firstText.value.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\](?:[ \t]+([^\n]*))?(?:\n|$)/i);
              if (m) {
                const kind = m[1].toLowerCase();
                const customTitle = (m[2] || '').trim();
                const defaultTitles = {
                  note: 'Note',
                  tip: 'Tip',
                  warning: 'Warning',
                  important: 'Important',
                  caution: 'Caution',
                };
                const title = customTitle || defaultTitles[kind] || 'Note';

                // Remove the [!KIND] header line from the first text node
                const rest = firstText.value.slice(m[0].length);
                if (rest.length > 0) {
                  firstText.value = rest;
                } else {
                  firstPara.children.shift();
                  // If paragraph became empty, remove it
                  if (firstPara.children.length === 0) {
                    child.children.shift();
                  }
                }

                // Transform blockquote into <aside class="callout callout-<kind>">
                child.data = {
                  hName: 'aside',
                  hProperties: { className: ['callout', `callout-${kind}`] },
                };
                child.children.unshift({
                  type: 'paragraph',
                  data: {
                    hName: 'div',
                    hProperties: { className: ['callout-title'] },
                  },
                  children: [{ type: 'text', value: title }],
                });
              }
            }
          }
        }
        visit(child);
      }
    };
    visit(tree);
  };
}
