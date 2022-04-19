import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterByIdPipe } from './filter-by-id.pipe';
import { FilterNeighborhoodsPipe } from './filter-neighborhoods';
import { FilterStreetsPipe } from './filter-streets.pipe';
import { FilterZonesPipe } from './filter-zones.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [FilterByIdPipe, FilterNeighborhoodsPipe, FilterStreetsPipe, FilterZonesPipe],
  exports: [FilterByIdPipe, FilterNeighborhoodsPipe, FilterStreetsPipe, FilterZonesPipe],
})
export class PipesModule {}
