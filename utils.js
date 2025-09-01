//utils
function add(total, num) {
    print(num);
    return total + num;
  }
  
  function either(num1, num2) {
    return Math.random() > 0.5 ? num1 : num2;
  }

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
export { add, either, generateUUID };