module.exports = function sleep(durationMs){
  return new Promise(resolve => setTimeout(resolve, durationMs));
}