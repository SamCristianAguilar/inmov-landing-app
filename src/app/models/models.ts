export class TypeProperty {
  public id: number;
  public name: string;
}

export class Feature {
  public id: number;
  public name: string;
  public group: FeatureGroup;
}

export class FeatureGroup {
  public id: number;
  public name: string;
}
export class StateProperty {
  public id: number;
  public name: string;
}

export class City {
  public id: number;
  public name: string;
}
export class Departament {
  public id: number;
  public name: string;
  public citys: City[];
}

export class ContractForRentRequest {
  public contractValue: number;
  public description: string;
  public holder: number;
  public property: PropertyRequest;
}
export class ContractForSaleRequest {
  public contractValue: number;
  public description: string;
  public holder: number;
  public property: PropertyRequest;
}
export class PropertyRequest {
  public title: string;
  public premium: boolean;
  public typeProperty: TypeProperty;
  public ownerId: number;
  public infoProperty: InfoProperty;
  public location: Location;
  public photos: Photos;
}

export class InfoProperty {
  public stratum: number;
  public area: number;
  public rooms: number;
  public baths: number;
  public garages: number;
  public interiorFoors: number;
  public stateProperty: StateProperty;
  public features: Feature[];
  public id?: number;
}

export class Location {
  public zone: string;
  public zipCode: string;
  public neighborhood: string;
  public address: string;
  public city: City;
  public id?: number;
}

export class Photos {
  public paths: string[];
}

export class PhotosResponse {
  public id: number;
  public pathName: string;
}

export class userResponse {
  public id: number;
  public docNumber: string;
  public name: string;
  public secondName: string;
  public firstLastName: string;
  public secondLastName: string;
  public createAt: Date;
  public updateAt: Date;
}
export class Owner extends userResponse {}
export class Holder extends userResponse {}

export class StateContract {
  public name: string;
  public id?: number;
}
export class ContractRes {
  public description: string;
  public holder: Holder;
  public state: StateContract;
  public updateAt: Date;
  public createAt: Date;
  public id: number;
}
export class forRentContractsRes extends ContractRes {
  public contractValue: string;
}
export class forSaleContractsRes extends ContractRes {
  public contractValue: string;
}

export class propertyResponse {
  public id: number;
  public title: string;
  public premium: boolean;
  public createAt: Date;
  public updateAt: Date;
  public owner: Owner;
  public location: Location;
  public infoProperty: InfoProperty;
  public photos: PhotosResponse[];
  public forRentContracts: forRentContractsRes[];
  public forSaleContracts: forSaleContractsRes[];
}

// id, title, premium, createAt, updateAt, location, infoProperty, photos, forRentContracts, forSaleContracts,
