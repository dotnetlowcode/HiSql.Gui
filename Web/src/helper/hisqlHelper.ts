import { List } from 'linqts';

export class HiSqlHelper {
  static HiSqlWhereToObj(sqlWhere: string) {
    const groups = new List(sqlWhere.split(/(or)|(and)/) ?? []).Where(r => r !== undefined);

    return {};
  }
}
