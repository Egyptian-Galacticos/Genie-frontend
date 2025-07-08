import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CategoryService } from './../../../../../shared/services/category.service';
import { Component, inject, input, OnInit, output } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import {
  Category,
  CreateCategoryInProduct,
  IProduct,
} from '../../../../../shared/utils/interfaces';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category',
  imports: [
    DividerModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './category.component.html',
})
export class CategoryComponent implements OnInit {
  private messageService = inject(MessageService);
  private categoryService = inject(CategoryService);
  categories!: Category[];

  beingEditedProduct = input<IProduct>();

  level0Categories: Category[] = [];
  level1Categories: Category[] = [];
  level2Categories: Category[] = [];

  selectedLevel0: number | null = null;
  selectedLevel1: number | null = null;
  selectedLevel2: number | null = null;

  showDialog = false;
  dialogLevel = 0;
  newCategoryName = '';

  categorySelected = output<CreateCategoryInProduct | null>();
  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: response => {
        this.categories = response;
        this.level0Categories = this.categories;
        if (this.beingEditedProduct()) {
          const category = this.categories.find(c =>
            c.children.find(x =>
              x.children.find(y => y.id === this.beingEditedProduct()?.category_id)
            )
          );
          const subCategory = category?.children.find(x =>
            x.children.find(y => y.id === this.beingEditedProduct()?.category_id)
          );
          const subSubCategory = subCategory?.children.find(
            x => x.id === this.beingEditedProduct()?.category_id
          );
          this.selectedLevel0 = category?.id || null;
          this.level1Categories = category?.children || [];
          this.selectedLevel1 = subCategory?.id || null;
          this.level2Categories = subCategory?.children || [];
          this.selectedLevel2 = subSubCategory?.id || null;
        }
      },
    });
  }

  onLevel0Change(event: SelectChangeEvent) {
    this.selectedLevel0 = event.value;
    this.selectedLevel1 = null;
    this.selectedLevel2 = null;

    if (this.selectedLevel0) {
      this.level1Categories =
        this.categories.find(c => c.id === this.selectedLevel0)?.children || [];
    } else {
      this.level1Categories = [];
    }
    this.level2Categories = [];
  }
  onLevel1Change(event: SelectChangeEvent) {
    this.selectedLevel1 = event.value;
    this.selectedLevel2 = null;

    if (this.selectedLevel1) {
      this.level2Categories =
        this.categories
          .find(c => c.id === this.selectedLevel0)
          ?.children.find(c => c.id === this.selectedLevel1)?.children || [];
    } else {
      this.level2Categories = [];
    }
  }
  onLevel2Change(event: SelectChangeEvent) {
    this.selectedLevel2 = event.value;
  }
  showAddDialog(level: number) {
    this.dialogLevel = level;
    this.newCategoryName = '';
    this.showDialog = true;
  }

  hideAddDialog() {
    this.showDialog = false;
    this.newCategoryName = '';
  }

  addNewCategory() {
    if (!this.newCategoryName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Category name is required',
      });
      return;
    }
    let parent_id: number | null = null;

    if (this.dialogLevel === 1 && this.selectedLevel0) {
      parent_id = this.selectedLevel0;
    } else if (this.dialogLevel === 2 && this.selectedLevel1) {
      parent_id = this.selectedLevel1;
    }

    const newCategory: Partial<Category> = {
      id: -1,
      name: this.newCategoryName.trim(),
      level: this.dialogLevel,
      parent_id: parent_id,
      children: [],
    };
    if (this.dialogLevel === 1 && this.selectedLevel0) {
      this.categories
        .find(c => c.id === this.selectedLevel0)
        ?.children?.push(newCategory as Category);
    } else if (this.dialogLevel === 2 && this.selectedLevel1) {
      this.categories
        .find(c => c.id === this.selectedLevel0)
        ?.children?.find(c => c.id === this.selectedLevel1)
        ?.children?.push(newCategory as Category);
    }
    this.hideAddDialog();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${this.getLevelName(this.dialogLevel)} "${newCategory.name}" added successfully`,
    });
  }

  getLevelName(level: number): string {
    switch (level) {
      case 0:
        return 'Main Category';
      case 1:
        return 'Sub Category';
      case 2:
        return 'Sub Sub Category';
      default:
        return 'Category';
    }
  }

  getParentCategoryName(): string {
    if (this.dialogLevel === 1 && this.selectedLevel0) {
      const parent = this.categories.find(c => c.id === this.selectedLevel0);
      return parent?.name || '';
    } else if (this.dialogLevel === 2 && this.selectedLevel1) {
      const parent = this.categories
        .find(c => c.id === this.selectedLevel0)
        ?.children.find(c => c.id === this.selectedLevel1);
      return parent?.name || '';
    }
    return '';
  }

  getSelectedCategoryPath(): string {
    if (!this.selectedLevel2) return '';

    const level0 = this.categories.find(c => c.id === this.selectedLevel0);
    const level1 = this.categories
      .find(c => c.id === this.selectedLevel0)
      ?.children.find(c => c.id === this.selectedLevel1);
    const level2 = this.categories
      .find(c => c.id === this.selectedLevel0)
      ?.children.find(c => c.id === this.selectedLevel1)
      ?.children.find(c => c.id === this.selectedLevel2);

    return `${level0?.name} > ${level1?.name} > ${level2?.name}`;
  }

  clearSelection() {
    this.selectedLevel0 = null;
    this.selectedLevel1 = null;
    this.selectedLevel2 = null;
    this.level1Categories = [];
    this.level2Categories = [];
    this.categorySelected.emit(null);
  }

  confirmSelection() {
    if (this.selectedLevel0 && this.selectedLevel1 && this.selectedLevel2) {
      const mainCategory = this.categories.find(c => c.id === this.selectedLevel0);
      const subCategory = mainCategory?.children.find(c => c.id === this.selectedLevel1);
      const subSubCategory = subCategory?.children.find(c => c.id === this.selectedLevel2);
      if (!mainCategory || !subCategory || !subSubCategory) return;

      const cat: CreateCategoryInProduct = {
        id: subSubCategory.id,
        name: subSubCategory.name,
        parent: {
          id: subCategory.id,
          name: subCategory.name,
          parent_id: mainCategory.id,
          parent: { id: mainCategory.id, name: mainCategory.name },
        } as CreateCategoryInProduct,
        parent_id: subCategory.id,
      };
      this.categorySelected.emit(cat);
      this.messageService.add({
        severity: 'success',
        summary: 'Category Selected',
        detail: `Selected: ${this.getSelectedCategoryPath()}`,
      });
    }
  }
}
