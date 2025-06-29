import { Link } from 'react-router-dom';

function About() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-blue-800 mb-3">{title}</h2>
      <div className="space-y-3 pl-4">{children}</div>
    </section>
  );

  const HowTo = (
    <Section title="How To Use This Site">
      <p>
        When the application is first brought up it displays North America. The geographic limitations are defined by the collection area from eBird. The overlay shows the abundance of all of the species that are tracked. The legend on the left indicates the maximum for this combination of data type and species. In other words, the purple will represent the same amount over the course of the year, but can change when other species or types are chosen.
      </p>
      <p>
        The radio buttons on the top represent the type of data - abundance or movement. See below for the full explanation.
      </p>
      <p>
        The drop-down lets the user select one species or all of the species of birds.
      </p>
      <p>
        On the bottom is a timeline displaying a year. The data is calculated on a weekly basis and uses information from the last decade. It does not update with current data. The user can click on a particular week or scroll backward or forward in time using the arrow keys.
      </p>
    </Section>
  );

  const Data = (
    <Section title="Data">
      <div>
        <h3 className="text-lg font-semibold text-blue-700 mb-1">Abundance</h3>
        <p>
          Abundance is derived from eBird weekly relative abundance (Fink et al. 2022) combined with population estimates from Partners in Flight (2020). The units are in birds per km<sup>2</sup>. The resolution of the data is 100 km - each cell is 100 km on a side - and thus does show fine scale variation in habitat that might make areas within each cell higher or lower than the cell value. The abundance data for each species is derived from 10 years of observations and thus represents how many birds of the selected species tend to be in the area at the given week of year but does not incorporate any real-time information on where birds are this particular year.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-blue-700 mb-1">Movement</h3>
        <p>
          Movement is estimated using BirdFlow models fit to the abundance data and represents migratory movement (not local flights) through an area in birds per km of transect per week. As in the abundance data movement represents generalized patterns from ten years of data.
        </p>
      </div>
    </Section>
  );

  const Species = (
    <Section title="Species">
      <p>
        The species shown in this model were selected by Ryan Miller (2024) as being potentially important for the transmission of Avian Influenza from wild birds into poultry. Four species he had selected were excluded. Mottled Duck and Mexican Duck were excluded because they were non-migratory and Cinnamon Teal and Long-tailed Duck were excluded because of poor model performance.
      </p>
    </Section>
  );

  const Outbreaks = (
    <Section title="Outbreaks">
      <p>
        The highly pathogenic avian influenza (HPAI) outbreak markers are based on the USDA Animal and Plant Health Inspection Service (APHIS) outbreak available for download at:&nbsp;
        <a
          href="https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/commercial-backyard-flocks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Confirmations of HPAI in Commercial and Backyard Flocks
        </a>. This app is updated periodically, link has the most up to date outbreak information.
      </p>
    </Section>
  );

  const MoreInformation = (
    <Section title="More Information">
      <p>
        <a href="https://birdflow-science.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          BirdFlow
        </a>
        &nbsp;is a joint project between the&nbsp;
        <a href="https://www.cics.umass.edu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          University of Massachusetts Amherst
        </a>
        &nbsp;and the&nbsp;
        <a href="https://www.birds.cornell.edu/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          Cornell Lab of Ornithology
        </a>
        &nbsp;funded by the&nbsp;
        <a href="https://www.nsf.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          US National Science Foundation
        </a>.
      </p>
      <p>
        <a href="https://birdflow-science.github.io/BirdFlowR/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          BirdFlowR
        </a>
        &nbsp;package was used to develop movement data and can be used to make predictions programmatically from BirdFlow models. Its documentation includes a page giving an&nbsp;
        <a href="https://birdflow-science.github.io/BirdFlowR/articles/BirdFlowOverview.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          Overview of the Uses and Limititations of BirdFlow models
        </a>.
      </p>
      <p>
        <a href="https://birdflow-science.s3.amazonaws.com/avian_flu/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          The Avian Influenza BirdFlow Model Collection
        </a>
        &nbsp;distributes the models used by this application.
      </p>
    </Section>
  );

  const Disclaimer = (
    <Section title="Disclaimer">
      <p>
        This material uses data from the eBird Status and Trends Project at the Cornell Lab of Ornithology,&nbsp;
        <a href="https://ebird.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
          eBird.org
        </a>. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the Cornell Lab of Ornithology.
      </p>
    </Section>
  );

  const Citations = (
    <Section title="Citations">
      <ul className="list-decimal ml-6 space-y-2 text-gray-700">
        <li>
          Fink, D., T. Auer, A. Johnston, M. Strimas-Mackey, S. Ligocki, O. Robinson, W. Hochachka, L. Jaromczyk,
          C. Crowley, K. Dunham, A. Stillman, I. Davies, A. Rodewald, V. Ruiz-Gutierrez, C. Wood. 2023.
          <a href="https://ebird.org/science/status-and-trends" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-1">
            eBird Status and Trends
          </a>
          , Data Version: 2022; Released: 2023. Cornell Lab of Ornithology, Ithaca, New York.
          <a href="https://doi.org/10.2173/ebirdst.2022" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-1">
            https://doi.org/10.2173/ebirdst.2022
          </a>
        </li>
        <li>
          Fuentes, Miguel, Benjamin M. Van Doren, Daniel Fink, and Daniel Sheldon.
          <a href="https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.14052" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-1">
            BirdFlow: Learning seasonal bird movements from eBird data
          </a>
          &nbsp; Methods in Ecology and Evolution 14, no. 3 (2023): 923-938.
          <a href="https://doi.org/10.1111/2041-210X.14052" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-1">
            https://doi.org/10.1111/2041-210X.14052
          </a>
        </li>
        <li>
          Miller, Ryan 2024 Personal communication.
        </li>
        <li>
          Partners in Flight. 2020. Population Estimates Database, version 3.1. Available at
          <a href="https://pif.birdconservancy.org/population-estimates-database" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-1">
            https://pif.birdconservancy.org/population-estimates-database
          </a>.
          Accessed on 2024-04-29.
        </li>
      </ul>
    </Section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-8 px-2 font-sans">
      <div className="relative bg-white/95 max-w-3xl w-full rounded-2xl shadow-xl px-8 py-10 overflow-hidden border border-blue-100">
        {/* Back arrow in top left */}
        <Link
          to="/"
          className="absolute top-4 left-4 text-blue-600 hover:text-blue-800 text-2xl"
          aria-label="Return to App"
        >
          ←
        </Link>

        {/* Decorative SVG feathers */}
        <svg className="absolute left-[-60px] top-[-40px] w-32 opacity-10 pointer-events-none" viewBox="0 0 64 64" fill="none">
          <path d="M12 52C28 28 52 12 52 12C52 12 36 36 12 52Z" fill="#228be6"/>
        </svg>
        <svg className="absolute right-[-50px] bottom-[-30px] w-28 opacity-10 pointer-events-none" viewBox="0 0 64 64" fill="none">
          <path d="M12 52C28 28 52 12 52 12C52 12 36 36 12 52Z" fill="#1976d2"/>
        </svg>

        {/* Centered logo and title */}
        <div className="flex flex-col items-center gap-4 mb-6 mt-2">
          <div className="relative w-16 h-20 flex items-end justify-center">
            {/* Location marker - positioned on top of bird's head */}
            <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2">
              <svg width="40" height="45" viewBox="0 0 40 45" style={{ display: 'block' }}>
                <path
                  d="M20 4 C28 4, 36 12, 20 38 C4 12, 12 4, 20 4Z"
                  fill="#228be6"
                />
                <circle cx="20" cy="16" r="7" fill="#fff"/>
                <circle cx="20" cy="16" r="4" fill="#228be6"/>
                <path
                  d="M20 4 C28 4, 36 12, 20 38 C4 12, 12 4, 20 4Z"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </div>
            {/* Flapping bird - blue */}
            <div className="flap-bird" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700 m-0 text-center font-sans">Avian Influenza</h1>
        </div>

        {HowTo}
        {Data}
        {Species}
        {Outbreaks}
        {MoreInformation}
        {Disclaimer}
        {Citations}
      </div>
    </div>
  );
}

export default About;