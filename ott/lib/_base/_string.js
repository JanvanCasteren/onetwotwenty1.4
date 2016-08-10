/**
 * Computes the sum of a sum given as string
 * @param sumStr A sum given as a string, eg 1+2, 2-1, 3*4 or 4/2
 */
String.prototype.computeSum = function () {
  var operator,
    arr,
    sumStr = this.toString()
    ;

  //remove outer whitespace
  sumStr = sumStr.trim();
  //get the two operands by splitting on the operator
  arr = sumStr.split(/[\+\-\*\/]/);
  //trim the operands
  arr = _.map(arr, function (value) {
    return value.trim();
  });
  //retrieve the operator by removing the operands
  //and trimming the result
  sumStr = sumStr.replace(arr[0], '');
  operator = sumStr.replace(arr[1], '').trim();

  //compute the answer
  switch (operator) {
    case '+':
      return parseInt(arr[0]) + parseInt(arr[1]);
    case '-':
      return parseInt(arr[0]) - parseInt(arr[1]);
    case '*':
      return parseInt(arr[0]) * parseInt(arr[1]);
    case '/':
      return parseInt(arr[0]) / parseInt(arr[1]);
    default:
      throw Error('Unexpected operator :' + operator);
  }
};