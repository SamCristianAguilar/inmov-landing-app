export class TypeProperty {
  constructor(public id: number, public name: string) {}
}

export class Feature {
  constructor(public id: number, public name: string) {}
}

export class StateProperty {
  constructor(public id: number, public name: string) {}
}

export class City {
  constructor(public id: number, public name: string) {}
}
export class Departament {
  constructor(public id: number, public name: string, public citys: City[]) {}
}
export interface newProperty {
  name: string;
  description: string;
  premium: boolean;
  typePropertyId: number;
  ownerId: number;
  features: number[];
  //   infoProperty: InfoPropertyDto;
  //   location: LocationDto;
  photos: any;
}
