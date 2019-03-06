import {
  getFixedProductLinks,
  getProductLink,
  getLicensedProductLinks,
  PRODUCT_DATA_MAP,
  ProductKey,
  getProductIsActive,
  getAdministrationLinks,
  getSuggestedProductLink,
} from '../../links';

const HOSTNAME = 'my-hostname.com';
const CLOUD_ID = 'some-cloud-id';
const ACTIVE_PRODUCT_STATE = {
  state: 'ACTIVE',
};
const generateLicenseInformation = (activeProducts: string[]) => {
  const products = activeProducts.reduce(
    (ans: { [productKey: string]: any }, next: string) => {
      ans[next] = ACTIVE_PRODUCT_STATE;
      return ans;
    },
    {},
  );
  return {
    hostname: HOSTNAME,
    products,
  };
};

describe('utils/links', () => {
  it('Fixed product list should have People', () => {
    const expectedProducts = ['people'];
    const fixedLinks = getFixedProductLinks();
    expect(fixedLinks.map(({ key }) => key)).toMatchObject(expectedProducts);
  });

  it('getProductLink should create a correct link config', () => {
    const productLink = getProductLink(ProductKey.CONFLUENCE);
    const expectedLink = {
      key: 'confluence.ondemand',
      ...PRODUCT_DATA_MAP[ProductKey.CONFLUENCE],
    };
    expect(productLink).toMatchObject(expectedLink);
  });

  describe('getProductIsActive', () => {
    const productKey = 'some.awesome.new.atlassian.product';
    const licenseInformation = generateLicenseInformation([productKey]);
    it('should return true if a product is active', () => {
      const result = getProductIsActive(licenseInformation, productKey);
      expect(result).toBe(true);
    });
    it('should return false if a product is not active', () => {
      const productKey = 'some.eol.product';
      const result = getProductIsActive(licenseInformation, productKey);
      expect(result).toBe(false);
    });
  });

  describe('getLicensedProductLinks', () => {
    it('should only add active products', () => {
      const licenseInformation = generateLicenseInformation([
        'confluence.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, false);
      expect(result.map(({ key }) => key)).toMatchObject([
        'confluence.ondemand',
      ]);
    });
    it('should not add Jira Core for Jira Software', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-software.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, false);
      expect(result.map(({ key }) => key)).toMatchObject([
        'jira-software.ondemand',
      ]);
    });
    it('should not add Jira Core for Jira Service Desk', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-servicedesk.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, false);
      expect(result.map(({ key }) => key)).toMatchObject([
        'jira-servicedesk.ondemand',
      ]);
    });
    it('should not add Jira Core for Jira Ops', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-incident-manager.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, false);
      expect(result.map(({ key }) => key)).toMatchObject([
        'jira-incident-manager.ondemand',
      ]);
    });
    it('should not use single Jira link if enabled without jira product', () => {
      const licenseInformation = generateLicenseInformation([
        'confluence.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, true);
      expect(result.map(({ key }) => key)).toMatchObject([
        'confluence.ondemand',
      ]);
    });
    it('should use single Jira link if enabled and there is jira product', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-software.ondemand',
        'jira-incident-manager.ondemand',
        'confluence.ondemand',
      ]);
      const result = getLicensedProductLinks(licenseInformation, true);
      expect(result.map(({ key }) => key)).toMatchObject([
        'jira',
        'confluence.ondemand',
      ]);
    });
  });

  describe('getAdministrationLinks', () => {
    it('should assemble admin links for site admins', () => {
      const isAdmin = true;
      const result = getAdministrationLinks(CLOUD_ID, isAdmin);
      const expectedResult = [
        `/admin/s/some-cloud-id/billing/addapplication`,
        `/admin/s/some-cloud-id`,
      ];
      expect(result.map(({ href }) => href)).toMatchObject(expectedResult);
    });
    it('should assemble admin links for site trusted users', () => {
      const isAdmin = false;
      const result = getAdministrationLinks(CLOUD_ID, isAdmin);
      const expectedResult = [
        `/trusted-admin/billing/addapplication`,
        `/trusted-admin`,
      ];
      expect(result.map(({ href }) => href)).toMatchObject(expectedResult);
    });
  });

  describe('getXSellLink', () => {
    it("should offer Confluence if it hasn't being activated", () => {
      const licenseInformation = generateLicenseInformation([
        'jira-software.ondemand',
      ]);
      const result = getSuggestedProductLink(licenseInformation);
      expect(result).not.toBe(null);
      expect(result && result.key).toBe('confluence.ondemand');
    });
    it('should offer Jira Service Desk if Confluence is active', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-software.ondemand',
        'confluence.ondemand',
      ]);
      const result = getSuggestedProductLink(licenseInformation);
      expect(result).not.toBe(null);
      expect(result && result.key).toBe('jira-servicedesk.ondemand');
    });
    it('should return null if Confluence and JSD are active', () => {
      const licenseInformation = generateLicenseInformation([
        'jira-servicedesk.ondemand',
        'confluence.ondemand',
      ]);
      const result = getSuggestedProductLink(licenseInformation);
      expect(result && result.key).toBe(null);
    });
  });
});
