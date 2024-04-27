exports.paginate=(arr, pageSize, pageNumber)=>{
  if (pageNumber<1) {
    pageNumber=1;
  }
  if (pageNumber>Math.ceil(arr.length/pageSize)) {
    return [];
  }
  return arr.slice((pageNumber-1)*pageSize, Math.min(pageNumber*pageSize, arr.length));
};
