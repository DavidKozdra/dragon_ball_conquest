//utils
function add(total, num) {
    print(num);
    return total + num;
  }
  
  function either(num1, num2) {
    return Math.random() > 0.5 ? num1 : num2;
  }


export { add, either };