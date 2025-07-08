import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

interface Company {
  name: string;
  logo: string;
  uniqueId?: string;
}

@Component({
  selector: 'app-companies',
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css',
})
export class CompaniesComponent implements OnInit {
  companies = signal<Company[]>([
    { name: 'Mistranet', logo: 'pi pi-building' },
    { name: 'BriteMark', logo: 'pi pi-circle' },
    { name: 'Limerantz', logo: 'pi pi-box' },
    { name: 'Streamlinz', logo: 'pi pi-link' },
    { name: 'Trimzales', logo: 'pi pi-globe' },
    { name: 'ZenTrailMs', logo: 'pi pi-bolt' },
    { name: 'Wavelength', logo: 'pi pi-compass' },
    { name: 'TechCore', logo: 'pi pi-server' },
    { name: 'Nexus', logo: 'pi pi-database' },
    { name: 'Quantum', logo: 'pi pi-cog' },
  ]);

  duplicatedCompanies = signal<Company[]>([]);

  ngOnInit() {
    this.duplicatedCompanies.set([
      ...this.companies().map((company, index) => ({ ...company, uniqueId: `original-${index}` })),
      ...this.companies().map((company, index) => ({ ...company, uniqueId: `duplicate-${index}` })),
    ]);
  }
}
