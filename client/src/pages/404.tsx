import GoogleAnalyticsHook from '@components/GoogleAnalyticsHook'

const FourOhFour: React.FC = () => {
  return <>
    <GoogleAnalyticsHook />

    <h1>404 - Page Not Found :(</h1>
    <a href="../">
      Click me to go to home page
    </a>
  </>
}
export default FourOhFour;