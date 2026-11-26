import appJson from '../../app.json';
import { APP_NAME } from '@/constants/app';

describe('nom commercial', () => {
  it('est identique dans le code et dans la configuration native', () => {
    expect(APP_NAME).toBe('ZENTECH DESIGN');
    expect(appJson.expo.name).toBe(APP_NAME);
    expect(appJson.expo.slug).toBe('zentech-design');
  });

  it("apparaît dans le texte d'autorisation d'accès aux photos", () => {
    const picker = appJson.expo.plugins.find((p) => Array.isArray(p) && p[0] === 'expo-image-picker');
    expect(JSON.stringify(picker)).toContain(APP_NAME);
  });
});
