import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords',
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, lineLimit: number = 3, trail: string = '...'): string {
    if (!value) return '';

    const lines = value.split('\n');

    if (lines.length <= lineLimit) {
      return value;
    }

    return lines.slice(0, lineLimit).join('\n') + trail;
  }
}
