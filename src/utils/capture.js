module.exports = function capture(fn){
  const res = {
    err: null,
    value: null
  };
  try {
    res.value = fn();
  }catch(e){
    res.err = e;
  }
  return res;
};
