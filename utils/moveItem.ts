export function moveItem(sourceArray, targetArray, item) {
  const index = sourceArray.indexOf(item);
  if (index > -1) {
    sourceArray.splice(index, 1); // Remove from source
    targetArray.push(item);       // Add to target
    return true;
  }
  return false;
}