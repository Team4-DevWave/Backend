class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // query incoming from mongodb
    this.queryString = queryString; // query incoming from express
  }
  filter() {
    //1A)filtering
    const queryObject = { ...this.queryString }; //hard copy
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);
    //1B)advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    //2)sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); //minus here means exclude that field when sorting
    }
    return this;
  }
  limitFields() {
    //3)field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // minus here means exclude that field if no fields are selected
    }
    return this;
  }
  paginate() {
    //4)pagination
    const page = this.queryString.page * 1 || 1; //multiplying by 1 converts string num into num
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page=3 &limit=10, 1-10 page 1,11-20 page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit); // in 1 page limit the results to a certain number of results and skip a certain number of results to reach the page u want;
    return this;
  }
}

module.exports=APIFeatures;