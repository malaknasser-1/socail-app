import { HydratedDocument, Model } from "mongoose";
type Filter = Record<string, any>;

export abstract class AbstractRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
  const doc = new this.model(data);
  return (await doc.save()) as unknown as HydratedDocument<T>;
}
  findById(id: string) {
    return this.model.findById(id);
  }
  findOne(filter: Filter) {
    return this.model.findOne(filter);
  }
  find(filter: Filter = {}) {
    return this.model.find(filter);
  }
  countDocuments(filter: Filter = {}) {
    return this.model.countDocuments(filter);
  }
  updateOne(filter: Filter, update: Filter) {
    return this.model.updateOne(filter, update);
  }
  updateMany(filter: Filter, update: Filter) {
    return this.model.updateMany(filter, update);
  }
  findOneAndUpdate(filter: Filter, update: Filter, options: Filter = {}) {
    return this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options });
  }
  deleteOne(filter: Filter) {
    return this.model.deleteOne(filter);
  }
  deleteMany(filter: Filter) {
    return this.model.deleteMany(filter);
  }
}
