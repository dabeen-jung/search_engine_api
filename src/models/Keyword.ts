import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { KeywordLink } from "./KeywordLink";
import { Link } from "./Link";

@Table
export class Keyword extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: bigint;

  @Unique
  @Column(DataType.STRING(40))
  name: string;

  @BelongsToMany(() => Link, () => KeywordLink)
  links: Link[];
}
