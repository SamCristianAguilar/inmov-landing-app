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

export class ContractForRentRequest {
  constructor(public contractValue: number, public description: string, public holder: number, public property: PropertyRequest) {}
}
export class PropertyRequest {
  constructor(
    public title: string,
    public premium: boolean,
    public typeProperty: TypeProperty,
    public ownerId: number,
    public infoProperty: InfoProperty,
    public location: Location,
    public photos: Photos
  ) {}
}

export class InfoProperty {
  constructor(
    public stratum: number,
    public area: number,
    public rooms: number,
    public baths: number,
    public garages: number,
    public interiorFoors: number,
    public stateProperty: StateProperty,
    public features: Feature[]
  ) {}
}

export class Location {
  constructor(public zone: string, public neighborhood: string, public address: string, public city: City) {}
}

export class Photos {
  constructor(public paths: string[]) {}
}
