const intersect = (b1, b2) => {
  return (
    b1.left <= b2.right &&
    b2.left <= b1.right &&
    b1.bottom <= b2.top &&
    b2.bottom <= b1.top
  );
};

const contain = (b1, b2) => {
  return (
    b1.left <= b2.left &&
    b1.right >= b2.right &&
    b1.bottom <= b2.bottom &&
    b1.top >= b2.top
  );
};

export default { intersect, contain };
