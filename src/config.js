import { base } from '@tokend/js-sdk'
import packageJson from '../package.json'

export default Object.assign(
  {
    /**
     * URL of the Horizon server. The application is going to fetch all the
     * needed network configs from the provided value.
     */
    HORIZON_SERVER: '',

    /**
     * URL of the storage server. Here will be stored pics and other uploadable
     * files.
     */
    FILE_STORAGE: '',

    /**
     * Will skip the email confirmation step during sign up. Instead of the
     * sipped step, the user will be instantly logged in and redirected
     * to the application.
     */
    SKIP_EMAIL_CONFIRMATION_STEP: false,

    /**
     * Disables certain features of the application. Set a property to false to
     * restrict usage of the feature by all users of the system
     */
    featureFlags: {
      dashboard: true,
      fees: true,
      trade: true,
      movements: true,
      issuance: true,
      assets: true,
      requests: true,
      settings: true,
      limits: true,
      sales: true,
      saleDetails: true,
    },

    /**
     * Sets the logging level, for more options visit
     * https://www.npmjs.com/package/loglevel#documentation
     */
    LOG_LEVEL: 'trace',

    /**
     * Default lower acceptable amount by most input fields. Tends to be
     * dropped one day
     */
    MIN_AMOUNT: String(1 / (base.Operation.ONE || 1000000)),

    /**
     * Default higher acceptable amount by most input fields. Tends to be
     * dropped one day
     */
    MAX_AMOUNT: String(base.Operation.MAX_INT64_AMOUNT),

    // deprecated constants

    /**
     * Default asset code for converting token's price,
     * trade and sale offers
     */
    DEFAULT_QUOTE_ASSET: 'USD',

    /**
     * Default limit of the number of transactions per a page
     */
    TRANSACTIONS_PER_PAGE: 12,

    /**
     * Default limit of the number of requests per a page
     */
    REQUESTS_PER_PAGE: 10,

    /**
     * Default amount precision, the number of digits
     * after a point
     */
    DECIMAL_POINTS: 6,

    /**
     * Default acceptable step for amount change,
     * depends on amount precision
     */
    MINIMAL_NUMBER_INPUT_STEP: 0.000001,

    /**
     * Default asset signer for pre-issuance upload
     */
    NULL_ASSET_SIGNER: 'GAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHV4',

    /**
     * Should be populated by DevOps team during the deployment
     * The field being displayed on login screen.
     */
    BUILD_VERSION: 'dev: ' + packageJson.version,
  },
  process.env,
  document.ENV
)
