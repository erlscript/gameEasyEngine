const nodeForEach = (
  node = { children: [] },
  func = console.log.bind(console)
) => {
  func(node);
  node.children.forEach(func);
};

export default { nodeForEach };
