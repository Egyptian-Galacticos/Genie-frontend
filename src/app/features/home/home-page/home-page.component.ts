import { Component } from '@angular/core';
import { HeroSectionComponent } from '../components/hero-section/hero-section.component';
import { CompaniesComponent } from '../components/companies/companies.component';
import { FeaturedSuppliersComponent } from '../components/featured-suppliers/featured-suppliers.component';
import { WhyChooseComponent } from '../components/why-choose/why-choose.component';
import { TrendingProductsComponent } from '../components/trending-products/trending-products.component';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from '../components/categories/categories.component';
import { GetStartedComponent } from '../components/get-started/get-started.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    HeroSectionComponent,
    CompaniesComponent,
    FeaturedSuppliersComponent,
    WhyChooseComponent,
    TrendingProductsComponent,
    CategoriesComponent,
    GetStartedComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
