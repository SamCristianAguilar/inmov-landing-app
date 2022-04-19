import { Injectable } from '@angular/core';
import { FilterContractReponse, forRentContractsRes, forSaleContractsRes, propertyResponse } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor() {}

  public filterContract(property: propertyResponse): FilterContractReponse {
    let contract: FilterContractReponse;
    if (property.forRentContracts.length > 0) {
      contract = new FilterContractReponse();
      contract.type = 'Arriendo';
      contract.contract = property.forRentContracts.find((cont) => cont.state.name == 'Activo');
    } else if (property.forSaleContracts.length > 0) {
      contract = new FilterContractReponse();
      contract.type = 'Venta';
      contract.contract = property.forSaleContracts.find((cont) => cont.state.name == 'Activo');
    }
    return contract;
  }

  public filterData(data, params: any, sort?, page?, perPage?) {
    if (params) {
      if (params.offer) {
        data = data.filter((property) => {
          let contractType;
          const contract = this.filterContract(property);
          if (contract) {
            if (contract.type == params.offer) {
              return true;
            }
          }
          return false;
        });
      }
      if (params.propertyType) {
        data = data.filter((property) => property.type.name == params.propertyType.name);
      }

      if (params.propertyStatus) {
        data = data.filter((property) => property.infoProperty.stateProperty.name == params.propertyStatus.name);
      }

      if (params.price) {
        if (params.price.from) {
          data = data.filter((property) => {
            let contractValue;
            const contract = this.filterContract(property);
            if (contract) {
              contractValue = Number(contract.contract.contractValue);
            }
            if (contractValue >= params.price.from) {
              return true;
            }
            return false;
          });
        }
        if (params.price.to) {
          data = data.filter((property) => {
            let contractValue;
            const contract = this.filterContract(property);
            if (contract) {
              contractValue = Number(contract.contract.contractValue);
            }
            if (contractValue >= params.price.to) {
              return true;
            }
            return false;
          });
        }
      }

      if (params.city) {
        data = data.filter((property) => property.location.neighborhood.zone.city.name == params.city.name);
      }

      if (params.zone) {
        data = data.filter((property) => property.location.neighborhood.zone.name == params.zone.name);
      }

      if (params.neighborhood) {
        data = data.filter((property) => property.location.neighborhood.name == params.neighborhood.name);
      }

      if (params.rooms) {
        if (params.rooms.from) {
          data = data.filter((property) => property.infoProperty.rooms >= params.rooms.from);
        }
        if (params.rooms.to) {
          data = data.filter((property) => property.infoProperty.rooms <= params.rooms.to);
        }
      }

      if (params.baths) {
        if (params.baths.from) {
          data = data.filter((property) => property.infoProperty.baths >= params.baths.from);
        }
        if (params.baths.to) {
          data = data.filter((property) => property.infoProperty.baths <= params.baths.to);
        }
      }

      if (params.garages) {
        if (params.garages.from) {
          data = data.filter((property) => property.infoProperty.garages >= params.garages.from);
        }
        if (params.garages.to) {
          data = data.filter((property) => property.infoProperty.garages <= params.garages.to);
        }
      }

      if (params.area) {
        if (params.area.from) {
          data = data.filter((property) => property.infoProperty.area >= params.area.from);
        }
        if (params.area.to) {
          data = data.filter((property) => property.infoProperty.area <= params.area.to);
        }
      }

      // if (params.yearBuilt) {
      //   if (params.yearBuilt.from) {
      //     data = data.filter((property) => property.yearBuilt >= params.yearBuilt.from);
      //   }
      //   if (params.yearBuilt.to) {
      //     data = data.filter((property) => property.yearBuilt <= params.yearBuilt.to);
      //   }
      // }

      if (params.features) {
        let arr = [];
        params.features.forEach((feature) => {
          if (feature.selected) arr.push(feature.name);
        });
        if (arr.length > 0) {
          let properties = [];
          data.filter((property) =>
            property.infoProperty.features.forEach((feature) => {
              if (arr.indexOf(feature.name) > -1) {
                if (!properties.includes(property)) {
                  properties.push(property);
                }
              }
            })
          );
          data = properties;
        }
      }
    }

    // console.log(data)

    //for show more properties mock data
    // for (var index = 0; index < 2; index++) {
    //   data = data.concat(data);
    // }

    return this.paginator(data, page, perPage);
  }

  public paginator(items, page?, perPage?) {
    var page = page || 1,
      perPage = perPage || 4,
      offset = (page - 1) * perPage,
      paginatedItems = items.slice(offset).slice(0, perPage),
      totalPages = Math.ceil(items.length / perPage);
    return {
      data: paginatedItems,
      pagination: {
        page: page,
        perPage: perPage,
        prePage: page - 1 ? page - 1 : null,
        nextPage: totalPages > page ? page + 1 : null,
        total: items.length,
        totalPages: totalPages,
      },
    };
  }
}
