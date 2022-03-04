import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AgmCoreModule } from '@agm/core';
import { InputFileModule } from 'ngx-input-file';
import { SubmitPropertyComponent } from './submit-property.component';
import { CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { CustomCurrencyMaskConfig } from 'src/app/common/utils/mask-configuration';

export const routes = [{ path: '', component: SubmitPropertyComponent, pathMatch: 'full' }];

@NgModule({
  declarations: [SubmitPropertyComponent],
  imports: [CurrencyMaskModule, CommonModule, RouterModule.forChild(routes), SharedModule, AgmCoreModule, InputFileModule],
  providers: [{ provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }],
})
export class SubmitPropertyModule {}
