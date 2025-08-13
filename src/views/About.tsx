import { Link } from 'react-router-dom';
import { IconStack2, IconExternalLink, IconInfoCircle, IconMessageCircle } from "@tabler/icons-react";
import BirdSVG from '../assets/Bird.svg';
import { useState } from 'react';
import FeedbackForm from './Feedback';

function About() {
  const [tab, setTab] = useState<'about' | 'feedback' | 'swagger'>('about');

  const handleTabClick = (selectedTab: typeof tab) => {
    if (selectedTab === 'swagger') {
      window.open('https://www.birdfluapi.com/__docs__/', '_blank', 'noopener,noreferrer');
      return;
    }
    setTab(selectedTab);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-blue-500 mb-3">{title}</h2>
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
        <h3 className="text-lg font-semibold text-blue-500 mb-1">Abundance</h3>
        <p>
          Abundance is derived from eBird weekly relative abundance (Fink et al. 2022) combined with population estimates from Partners in Flight (2020). The units are in birds per km<sup>2</sup>. The resolution of the data is 100 km - each cell is 100 km on a side - and thus does show fine scale variation in habitat that might make areas within each cell higher or lower than the cell value. The abundance data for each species is derived from 10 years of observations and thus represents how many birds of the selected species tend to be in the area at the given week of year but does not incorporate any real-time information on where birds are this particular year.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-blue-500 mb-1">Movement</h3>
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
          className="text-blue-600 underline hover:text-blue-500"
        >
          Confirmations of HPAI in Commercial and Backyard Flocks
        </a>. This app is updated periodically, link has the most up to date outbreak information.
      </p>
    </Section>
  );

  const MoreInformation = (
    <Section title="More Information">
      <p>
        <a href="https://birdflow-science.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          BirdFlow
        </a>
        &nbsp;is a joint project between the&nbsp;
        <a href="https://www.cics.umass.edu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          University of Massachusetts Amherst
        </a>
        &nbsp;and the&nbsp;
        <a href="https://www.birds.cornell.edu/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          Cornell Lab of Ornithology
        </a>
        &nbsp;funded by the&nbsp;
        <a href="https://www.nsf.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          US National Science Foundation
        </a>.
      </p>
      <p>
        <a href="https://birdflow-science.github.io/BirdFlowR/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          BirdFlowR
        </a>
        &nbsp;package was used to develop movement data and can be used to make predictions programmatically from BirdFlow models. Its documentation includes a page giving an&nbsp;
        <a href="https://birdflow-science.github.io/BirdFlowR/articles/BirdFlowOverview.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
          Overview of the Uses and Limititations of BirdFlow models
        </a>.
      </p>
      <p>
        <a href="https://birdflow-science.s3.amazonaws.com/avian_flu/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
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
        <a href="https://ebird.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500">
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
          <a href="https://ebird.org/science/status-and-trends" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            eBird Status and Trends
          </a>
          , Data Version: 2022; Released: 2023. Cornell Lab of Ornithology, Ithaca, New York.
          <a href="https://doi.org/10.2173/ebirdst.2022" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://doi.org/10.2173/ebirdst.2022
          </a>
        </li>
        <li>
          Fuentes, Miguel, Benjamin M. Van Doren, Daniel Fink, and Daniel Sheldon.
          <a href="https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.14052" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            BirdFlow: Learning seasonal bird movements from eBird data
          </a>
          &nbsp; Methods in Ecology and Evolution 14, no. 3 (2023): 923-938.
          <a href="https://doi.org/10.1111/2041-210X.14052" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://doi.org/10.1111/2041-210X.14052
          </a>
        </li>
        <li>
          Miller, Ryan 2024 Personal communication.
        </li>
        <li>
          Partners in Flight. 2020. Population Estimates Database, version 3.1. Available at
          <a href="https://pif.birdconservancy.org/population-estimates-database" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://pif.birdconservancy.org/population-estimates-database
          </a>.
          Accessed on 2024-04-29.
        </li>
        <li>
          Development of this application was funded by the USDA and USGS.
        </li>
      </ul>
    </Section>
  );

  const AboutThisSite = (
    <Section title="About this site">
      <p>
        This site informs poultry producers and others about wild bird movement, abundance, and current Avian Influenza outbreaks with the goal of informing risk management for avian influenza. The application displays five distinct types of information that all relate to and serve as indicators of risk but does not (yet) model or display risk directly.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Data Layers</h3>
      <p>
        Data display is controlled by the{' '}
        <span className="inline-flex items-center justify-center align-middle bg-blue-100 border border-blue-400 rounded-md p-0.5">
          <IconStack2 size={18} className="text-blue-700" />
        </span>{' '}
        layer button. The application can display known outbreak locations as markers over several types of information on wild birds, which are displayed one at a time as images.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Outbreaks Locations</h3>
      <p>
        Known outbreaks of High Pathogenic Avian Influenza (HPAI) appear as markers on the map above the image data, and can be toggled on and off independently. The data are from the USDA Animal and Plant Health Inspection Service (APHIS). Outbreak locations are displayed near the center of the county they are associated with. Each outbreak is separately randomly offset slightly from its county center so multiple outbreaks in the county do not all overlap each other. Thus although each outbreak is shown at a precise location (if you zoom way in) this is NOT the actual location of the outbreak.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Recent Outbreaks</h3>
      <p>
        These markers indicate counties with High Pathogenic Avian Influenza (HPAI) outbreaks at poultry farms and backyard flocks within the current calendar year. The transparency is adjusted relative to the active display date or in the case of inflow and outflow the projection start date as follows:
      </p>
      <ul className="list-disc ml-6">
        <li>Preceding 3 weeks (fully opaque)</li>
        <li>Earlier than 3 weeks before the active, displayed date (25% transparent)</li>
        <li>After the active display date (50% transparent)</li>
      </ul>
      <p>
        Thus sliding the display date or changing the reference date will change which outbreaks are emphasized with the most emphasis on those immediately preceding the display date.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Historical Outbreaks</h3>
      <p>
        These represent outbreaks at poultry farms prior to the current calendar year - those not shown in the Recent Outbreak layer. They are always displayed 35% transparent.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Image Data</h3>
      <p>
        Each image dataset covers a large portion of the map with pixels that vary in color to indicate the values in the associated data. For instance with the abundance data the color indicates the density of birds (birds/km). Because this data covers large portions of the map only one image data set can be displayed at a time and selecting any one of them with the layer button will switch to that layer - turning off the prior image layer. All of the image data has a resolution of roughly 100 km – values are set for pixels that are about 100 x 100 km.
      </p>
      <h4 className="text-md font-semibold text-blue-500 mb-1">Species</h4>
      <p>
        Each of the image layers can be displayed either for an individual species or for the total across all 9 species — controlled with the species selection button{' '}
        <img
          src={BirdSVG}
          alt="Bird icon"
          className="inline align-middle"
          style={{ width: 24, height: 24 }}
        />. All of the image data has a resolution of 100 km – values are set for pixels that are 100 × 100 km.
      </p>

      <h4 className="text-md font-semibold text-blue-500 mb-1">Active Date</h4>
      <p>
        All of the image data varies over time and the displayed date is controlled by sliding the active date indicator{' '}
        <span
          className="timeline-marker"
          style={{
            display: 'inline-flex',
            verticalAlign: 'middle',
          }}
        >
          <span className="timeline-marker-label">Apr 26</span>
        </span>{' '}
        along the timeline at the bottom, or pressing the play button to animate over time.
      </p>


      <h3 className="text-lg font-semibold text-blue-500 mb-1">Abundance</h3>
      <p>
        Abundance is the expected density of birds in birds/km² for the selected species or total. Abundance is from eBird weekly relative abundance (Fink et al. 2022) combined with population estimates from Partners in Flight (2020). The resolution of the data is 100 km - each cell is 100 km on a side - and thus does show fine scale variation in habitat that might make areas within each cell higher or lower than the cell value. The abundance data for each species is derived from 10 years of observations and thus represents how many birds tend to be in the area at the given week of year. It does not incorporate any real time information.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Movement</h3>
      <p>
        Movement represents migratory traffic through each part of the landscape in birds/km/week - how many birds are expected to migrate over a kilometer long transect in a week. It is estimated using BirdFlow models which are built using the same eBird data displayed in abundance, and likewise represents generalized patterns derived from ten years of eBird data, and does not incorporate any real time information.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Inflow/Outflow</h3>
      <p>
        These layers represent projections of where birds that are at a given location on a given date might be coming from (inflow) or going (outflow). In both cases the result is an estimate of the number of birds that were at the reference location and date that are likely to be in each part of the landscape at the projected time in birds/km². Unlike the other image data this projection is made in response to user input so whenever either the starting location or date changes new predictions will need to be made. For any prediction you can slide the display date forward and back over the projected time frame (blue arrow) to see how the predictions change over time.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Species selection</h3>
      <p>
        The species shown in this model were selected as being important hosts and possible vectors for High Pathogenic Avian Influenza (Miller, 2024). Four species from the original species list were dropped—two species, Mottled Duck and Mexican Duck, because they were non-migratory; two others, Cinnamon Teal and Long-tailed Duck, because of poor model performance.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">More Information</h3>
      <p>
        BirdFlow is a joint project between the University of Massachusetts Amherst and the Cornell Lab of Ornithology funded by the US National Science Foundation.
        BirdFlowR package was used to develop movement data and can be used to make predictions programmatically from BirdFlow models. Its documentation includes a page giving an Overview of the Uses and Limititations of BirdFlow models.
        The Avian Influenza BirdFlow Model Collection distributes the models used by this application for use with the BirdFlowR, R package.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Disclaimer</h3>
      <p>
        This material uses data from the eBird Status and Trends Project at the Cornell Lab of Ornithology, eBird.org. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the Cornell Lab of Ornithology.
      </p>
      <h3 className="text-lg font-semibold text-blue-500 mb-1">Citations</h3>
      <ul className="list-decimal ml-6 space-y-2 text-gray-700">
        <li>
          Fink, D., T. Auer, A. Johnston, M. Strimas-Mackey, S. Ligocki, O. Robinson, W. Hochachka, L. Jaromczyk, C. Crowley, K. Dunham, A. Stillman, I. Davies, A. Rodewald, V. Ruiz-Gutierrez, C. Wood. 2023.eBird Status and Trends, Data Version: 2022; Released: 2023. Cornell Lab of Ornithology, Ithaca, New York.
          <a href="https://doi.org/10.2173/ebirdst.2022" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://doi.org/10.2173/ebirdst.2022
          </a>
        </li>
        <li>
          Fuentes, Miguel, Benjamin M. Van Doren, Daniel Fink, and Daniel Sheldon. BirdFlow: Learning seasonal bird movements from eBird data  Methods in Ecology and Evolution 14, no. 3 (2023): 923-938.
          <a href="https://doi.org/10.1111/2041-210X.14052" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://doi.org/10.1111/2041-210X.14052
          </a>
        </li>
        <li>
          Miller, Ryan 2024 Personal communication.
        </li>
        <li>
          Partners in Flight. 2020. Population Estimates Database, version 3.1. Available at
          <a href="https://pif.birdconservancy.org/population-estimates-database" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-500 ml-1">
            https://pif.birdconservancy.org/population-estimates-database
          </a>. Accessed on 2024-04-29.
        </li>
        <li>
          Development of this application was funded by the USDA and USGS.
        </li>
      </ul>
    </Section>
  );

  const TabMenu = (
    <nav className="sticky top-0 z-30 bg-white/90 border-b border-blue-100 flex gap-2 justify-center py-3 mb-8 rounded-t-2xl shadow-sm">
      <button
        className={`flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold transition
          ${tab === 'about'
            ? 'bg-blue-100 text-blue-700 shadow border-b-2 border-blue-600'
            : 'text-blue-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        onClick={() => handleTabClick('about')}
        type="button"
        aria-current={tab === 'about' ? 'page' : undefined}
      >
        <IconInfoCircle size={18} className="text-blue-500" />
        About
      </button>
      <button
        className={`flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold transition
          ${tab === 'feedback'
            ? 'bg-blue-100 text-blue-700 shadow border-b-2 border-blue-600'
            : 'text-blue-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        onClick={() => handleTabClick('feedback')}
        type="button"
        aria-current={tab === 'feedback' ? 'page' : undefined}
      >
        <IconMessageCircle size={18} className="text-blue-500" />
        Feedback
      </button>
      <a
        href="https://www.birdfluapi.com/__docs__/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold text-blue-700 hover:bg-blue-50 hover:text-blue-600 transition"
        style={{ textDecoration: 'none' }}
      >
        <IconExternalLink size={18} className="text-blue-500" />
        Test REST API
      </a>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-8 px-2 font-sans">
      <div className="relative bg-white/95 max-w-3xl w-full rounded-2xl shadow-xl px-8 py-10 overflow-auto border border-blue-100" style={{ maxHeight: '90vh' }}>
        {/* Back arrow in top left */}
        <Link
          to="/"
          className="absolute top-4 left-4 text-blue-600 hover:text-blue-500 text-2xl"
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
          <h1 className="text-3xl font-bold text-blue-500 m-0 text-center font-sans">Avian Influenza</h1>
        </div>

        {/* Tab menu: sticky inside card */}
        <nav className="sticky top-0 z-30 bg-white/90 border-b border-blue-100 flex gap-2 justify-center py-3 mb-8 rounded-t-2xl shadow-sm">
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold transition
              ${tab === 'about'
                ? 'bg-blue-100 text-blue-700 shadow border-b-2 border-blue-600'
                : 'text-blue-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            onClick={() => handleTabClick('about')}
            type="button"
            aria-current={tab === 'about' ? 'page' : undefined}
          >
            <IconInfoCircle size={18} className="text-blue-500" />
            About
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold transition
              ${tab === 'feedback'
                ? 'bg-blue-100 text-blue-700 shadow border-b-2 border-blue-600'
                : 'text-blue-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            onClick={() => handleTabClick('feedback')}
            type="button"
            aria-current={tab === 'feedback' ? 'page' : undefined}
          >
            <IconMessageCircle size={18} className="text-blue-500" />
            Feedback
          </button>
          <a
            href="https://www.birdfluapi.com/__docs__/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-t-lg font-semibold text-blue-700 hover:bg-blue-50 hover:text-blue-600 transition"
            style={{ textDecoration: 'none' }}
          >
            <IconExternalLink size={18} className="text-blue-500" />
            Test REST API
          </a>
        </nav>

        {tab === 'about' && (
          <>
            {AboutThisSite}
            {/* {Data}
            {Species}
            {Outbreaks}
            {MoreInformation}
            {Disclaimer}
            {Citations} */}
          </>
        )}
        {tab === 'feedback' && <FeedbackForm />}
        {/* Swagger tab does not render content, just opens the link */}
      </div>
    </div>
  );
}

export default About;