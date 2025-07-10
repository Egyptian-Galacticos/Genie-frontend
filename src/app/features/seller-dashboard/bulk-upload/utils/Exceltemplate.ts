import { Category } from './../../../shared/utils/interfaces';
import { TemplateData } from '../../../shared/utils/interfaces';
import * as XLSX from 'xlsx';

export const downloadTemplate = (categories: Category[]) => {
  // Create sample data with proper structure
  const templateData: TemplateData[] = [
    {
      name: 'Sample Product 1',
      description: 'High-quality sample product with excellent features',
      category_id: 1,
      currency: 'USD',
      origin: 'USA',
      sku: 'SKU001',
      weight: 1.5,
      'dimensions.length': 10,
      'dimensions.width': 8,
      'dimensions.height': 6,
      main_image: 'https://picsum.photos/300',
      brand: 'Sample Brand',
      model_number: 'MODEL001',
      hs_code: '1234567890',
      sample_available: true,
      sample_price: 19.99,
      tags: 'tag1,tag2,tag3',
      images: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
      documents: 'https://example.com/doc1.pdf',
      specifications: 'optional (files)',
      'price_tiers.0.from_quantity': 1,
      'price_tiers.0.to_quantity': 10,
      'price_tiers.0.price': 99.99,
      'price_tiers.1.from_quantity': 11,
      'price_tiers.1.to_quantity': 50,
      'price_tiers.1.price': 89.99,
    },
    {
      name: 'Sample Product 2',
      description: 'Another great product for demonstration',
      category_id: 2,
      currency: 'USD',
      origin: 'Canada',
      sku: 'SKU002',
      weight: 2.3,
      'dimensions.length': 15,
      'dimensions.width': 12,
      'dimensions.height': 8,
      main_image: 'https://example.com/image2.jpg',
      brand: 'Premium Brand',
      model_number: 'MODEL002',
      hs_code: '0987654321',
      sample_available: false,
      sample_price: '',
      tags: 'premium,quality',
      images: 'https://example.com/img3.jpg',
      documents: '',
      specifications: 'optional (files)',
      'price_tiers.0.from_quantity': 1,
      'price_tiers.0.to_quantity': 25,
      'price_tiers.0.price': 149.99,
    },
  ];
  const sheetTwoData = categories.map(category => ({
    name: category.name,
    id: category.id,
  }));
  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(templateData);
  const ws2 = XLSX.utils.json_to_sheet(sheetTwoData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.utils.book_append_sheet(wb, ws2, 'Categories');

  // Set column widths
  const colWidths = [
    { wch: 20 }, // name
    { wch: 40 }, // description
    { wch: 10 }, // price
    { wch: 8 }, // currency
    { wch: 12 }, // origin
    { wch: 12 }, // sku
    { wch: 8 }, // weight
    { wch: 12 }, // dimensions.length
    { wch: 12 }, // dimensions.width
    { wch: 12 }, // dimensions.height
    { wch: 30 }, // main_image
    { wch: 15 }, // brand
    { wch: 15 }, // model_number
    { wch: 15 }, // hs_code
    { wch: 12 }, // sample_available
    { wch: 12 }, // sample_price
    { wch: 20 }, // tags
    { wch: 30 }, // images
    { wch: 30 }, // documents
    { wch: 20 }, // specifications
  ];
  ws['!cols'] = colWidths;

  // Save file
  XLSX.writeFile(wb, 'product_template.xlsx');
};
