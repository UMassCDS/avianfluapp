import { Link } from 'react-router-dom';
import '../styles/Default.css';


/**
 * Renders the About page for the Avian Influenza application.
 *
 * This component provides detailed information and documentation about the application, including:
 * - Instructions on how to use the site
 * - Data sources and methodology for abundance and movement data
 * - Information about the species included in the model
 * - Details about avian influenza outbreak data
 * - Additional resources and links for further information
 * - Disclaimer regarding data usage and opinions
 * - Citations for all referenced data and publications
 *
 * @component
 * @returns {JSX.Element} The About page content as a React element.
 */
function About(this: any) {

    const HowTo = (
        <div>
            <h2>How To Use This Site</h2>
            <p>When the application is first brought up it displays North America. 
                The geographic limitations are defined by the collection area from eBird. 
                The overlay shows the abundance of all of the species that are tracked. 
                The legend on the left indicates the maximum for this combination of data type and species. 
                In other words, the purple will represent the same amount over the course of the year, 
                but can change when other species or types are chosen. 
            </p><p>
                The radio buttons on the top represent the type of data - abundance or movement. 
                See below for the full explanation.
            </p><p> 
                The drop-down lets the user select one species or all of the species of birds.
            </p><p>
                On the bottom is a timeline displaying a year. The data is calculated on a weekly basis 
                and uses information from the last decade. It does not update with current data.  
                The user can click on a particular week or scroll backward or forward in time using the arrow keys. 
            </p>
        </div>
    );

    const Data = (
        <div>
            <h2>Data</h2>
            <h3>Abundance</h3>
            <p>Abundance is derived from eBird weekly relative abundance (Fink et al. 2022) combined with population estimates 
                from Partners in Flight (2020). The units are in birds per km^2.  The resolution of the data is 100 km - each cell 
                is 100 km on a side - and thus does show fine scale variation in habitat that might make areas within each cell 
                higher or lower than the cell value.  The abundance data for each species is derived from 10 years of observations
                and thus represents how many birds of the selected species tend to be in the area at the given week of year 
                but does not incorporate any real-time information on where birds are this particular year.
            </p>
            <h3>Movement</h3>
            <p>Movement is estimated using BirdFlow models fit to the abundance data and represents migratory movement 
            (not local flights) through an area in birds per km of transect per week.  As in the abundance data movement
            represents generalized patterns from ten years of data. </p>
        </div>
    );

    const Species = (
        <div>
            <h2>Species</h2>
            <p>The species shown in this model were selected by Ryan Miller (2024) as being potentially important for the 
                transmission of Avian Influenza from wild birds into poultry. Four species he had selected were excluded. 
                Mottled Duck and Mexican Duck were excluded because they were non-migratory and Cinnamon Teal and 
                Long-tailed Duck were excluded because of poor model performance.</p>
        </div>
    );

    const MoreInformation = (
        <div>
            <h2>More Information</h2>
            <p><a href="https://birdflow-science.github.io/" target="_blank">BirdFlow</a>
                &nbsp;is a joint project between the <a href="https://www.cics.umass.edu/" target="_blank">University of Massachusetts Amherst</a>
                &nbsp;and the <a href="https://www.birds.cornell.edu/home" target="_blank">Cornell Lab of Ornithology</a> 
                &nbsp;funded by the <a href="https://www.nsf.gov" target="_blank">US National Science Foundation</a>.
            </p>
            <p> <a href="https://birdflow-science.github.io/BirdFlowR/" target="_blank">BirdFlowR</a>
                &nbsp;package was used to develop movement data and can be used to make predictions 
                programmatically from BirdFlow models. Its documentation includes a page giving an&nbsp;
                <a href="https://birdflow-science.github.io/BirdFlowR/articles/BirdFlowOverview.html" target="_blank">
                Overview of the Uses and Limititations of BirdFlow models</a>.
            </p>
            <p>
                <a href="https://birdflow-science.s3.amazonaws.com/avian_flu/index.html" target="_blank">
                The Avian Influenza BirdFlow Model Collection</a> distributes the models used by this application. 
            </p>
        </div>
    );

    const Disclaimer = (
        <div>
            <h2>Disclaimer</h2>
            <p>This material uses data from the eBird Status and Trends Project at the Cornell Lab of Ornithology,
            &nbsp;<a href="https://ebird.org" target="_blank">eBird.org</a>. Any opinions, findings, and conclusions or 
            recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the Cornell Lab of Ornithology.</p>
        </div>
    );

    const Citations = (
        <div>
            <h2>Citations</h2>
            <p>
                Fink, D., T. Auer, A. Johnston, M. Strimas-Mackey, S. Ligocki, O. Robinson, W. Hochachka, L. Jaromczyk, 
                C. Crowley, K. Dunham, A. Stillman, I. Davies, A. Rodewald, V. Ruiz-Gutierrez, C. Wood. 2023. 
                &nbsp;<a href="https://ebird.org/science/status-and-trends" target="_blank">eBird Status and Trends</a>, 
                Data Version: 2022; Released: 2023. Cornell Lab of Ornithology, Ithaca, New York. 
                &nbsp;<a href="https://doi.org/10.2173/ebirdst.2022" target="_blank">https://doi.org/10.2173/ebirdst.2022</a>
            </p>
            <p>
                Fuentes, Miguel, Benjamin M. Van Doren, Daniel Fink, and Daniel Sheldon. 
                <a href="https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.14052" target="_blank">
                BirdFlow: Learning seasonal bird movements from eBird data</a>
                &nbsp; Methods in Ecology and Evolution 14, no. 3 (2023): 923-938. 
                <a href="https://doi.org/10.1111/2041-210X.14052" target="_blank">https://doi.org/10.1111/2041-210X.14052</a>
            </p>
            <p>
                Miller, Ryan 2024 Personal communication.
            </p>
            <p>
                Partners in Flight. 2020. Population Estimates Database, version 3.1. Available at 
                &nbsp;<a href="https://pif.birdconservancy.org/population-estimates-database" target="_blank">
                https://pif.birdconservancy.org/population-estimates-database</a>. 
                Accessed on 2024-04-29.
            </p>
        </div>
    );

    const Outbreaks = (
        <div>
            <h2>Outbreaks</h2>
            <p> The highly pathogenic avian influenza (HPAI) outbreak markers are based on the USDA Animal 
                and Plant Health Inspection Service (APHIS) outbreak available for download at:&nbsp;
                <a href="https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/commercial-backyard-flocks" target="_blank">
                Confirmations of HPAI in Commercial and Backyard Flocks</a>. This app is updated periodically, link has the most up to date outbreak information.
            </p>
        </div>
    );

    return (
    <div className="DefaultPage">
        <h1 style={{textAlign:"center"}}>Avian Influenza</h1>
        <Link to="/">Return to App</Link>
        {HowTo}
        {Data}
        {Species}
        {Outbreaks}
        {MoreInformation}
        {Disclaimer}
        {Citations}        
    </div>
  );
}

export default About;