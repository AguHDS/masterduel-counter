export const renderContent = (content: string): string => {
  const lines = content.split('\n');
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = line.startsWith('- ');

    if (isListItem) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${line.slice(2)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line === '') {
        result.push('<br />');
      } else {
        result.push(line);
        if (i < lines.length - 1) {
          result.push('<br />');
        }
      }
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
};
