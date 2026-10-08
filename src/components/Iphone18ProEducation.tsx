import { Link } from "react-router-dom";
import type { EditorialImage } from "../catalog/editorialStories";
import "../styles/iphone-18-pro-education.css";

type Lesson = { title: string; explanation: string };

function Lessons({ items }: { items: Lesson[] }) {
  return <div className="iphone-edu-lessons">{items.map((item) => <article className="iphone-edu-lesson" key={item.title}>
    <h3>{item.title}</h3><p>{item.explanation}</p>
  </article>)}</div>;
}

function Section({ id, number, label, title, intro, children, dark = false }: {
  id: string; number: string; label: string; title: string; intro: string; children: React.ReactNode; dark?: boolean;
}) {
  return <section id={id} className={`iphone-edu-section${dark ? " iphone-edu-dark" : ""}`} aria-labelledby={`${id}-title`}>
    <div className="iphone-edu-inner">
      <div className="iphone-edu-heading"><span className="iphone-edu-index">{number} / {label}</span><h2 id={`${id}-title`}>{title}</h2><p>{intro}</p></div>
      {children}
    </div>
  </section>;
}

export function Iphone18ProEducation({ buyPath, hero }: { buyPath: string; hero: EditorialImage }) {
  return <div className="iphone-edu">
    <section className="iphone-edu-overview" id="highlights" aria-labelledby="iphone-edu-overview-title">
      <div className="iphone-edu-inner">
        <span className="iphone-edu-index">THE ESSENTIALS</span>
        <h2 id="iphone-edu-overview-title">A Pro phone, explained.</h2>
        <p className="iphone-edu-lead">The iPhone 18 Pro brings a capable camera system, a fluid OLED display, strong sustained performance, and practical tools for everyday life. Here is what those features actually mean when you use them.</p>
        <div className="iphone-edu-facts" aria-label="Key iPhone 18 Pro specifications">
          <div><strong>6.3-inch</strong><span>OLED display</span></div>
          <div><strong>A20 Pro</strong><span>chip</span></div>
          <div><strong>48MP</strong><span>Main camera</span></div>
          <div><strong>USB-C</strong><span>and MagSafe</span></div>
        </div>
      </div>
    </section>

    <Section id="craftsmanship" number="01" label="DESIGN" title="Made to be held and used." intro="The iPhone 18 Pro combines an aluminum unibody with Ceramic Shield 2 on the front and Ceramic Shield on the back. Its 6.3-inch size is the smaller of the two Pro models; Apple lists its weight at 211 grams." dark>
      <Lessons items={[
        { title: "How it feels", explanation: "The compact Pro size is easier to manage one-handed than the Pro Max, while still leaving room for a large screen. The aluminum body is built to support the phone's thermal system during demanding work." },
        { title: "Controls that save steps", explanation: "The Action button can be assigned to a task you use often, such as the camera, flashlight, or a Shortcut. Camera Control puts shooting adjustments within reach without hunting through menus." },
        { title: "Protection and finishes", explanation: "Ceramic Shield helps protect the glass, and IP68 is a tested water-and-dust-resistance rating, not a promise against every spill or swim. Apple lists Black, Silver, Glacier, and Burgundy finishes." },
      ]} />
      <figure className="iphone-edu-figure iphone-edu-figure-hero"><img src={hero.src} alt="Illustrative burgundy front and rear iPhone render" loading="lazy" decoding="async" /><figcaption>Illustrative product render. Confirm the exact appearance and variant before ordering.</figcaption></figure>
    </Section>

    <Section id="display" number="02" label="DISPLAY" title="A screen that adapts to the moment." intro="The 6.3-inch Super Retina XDR OLED display is sharp at 2622 by 1206 pixels. OLED can show deep blacks alongside bright highlights, which helps photos, films, and text look clear." >
      <Lessons items={[
        { title: "Smoother when it matters", explanation: "ProMotion adapts the refresh rate up to 120Hz. Scrolling and supported games can look more fluid, while the screen can slow down when extra frames are unnecessary." },
        { title: "More useful outdoors", explanation: "Apple rates peak outdoor brightness at 3,000 nits and adds an anti-reflective coating. That helps visibility in strong light, though real-world readability still depends on the conditions." },
        { title: "Information at a glance", explanation: "Always-On can keep the time and useful updates visible without fully waking the phone. HDR support gives compatible video and photos a wider range between light and dark areas." },
      ]} />
      <figure className="iphone-edu-figure iphone-edu-figure-display"><img src="/products/story/iphone-18-pro-supplied-blue-front-back.jpg" alt="Illustrative Glacier iPhone front and back showing its full display and camera plateau" loading="lazy" decoding="async" /><figcaption>Illustrative Glacier finish and display render.</figcaption></figure>
    </Section>

    <Section id="silicon" number="03" label="PERFORMANCE" title="Speed you notice after the first tap." intro="A20 Pro combines a 6-core CPU, 7-core GPU, and hardware-accelerated ray tracing. The point is not the core count by itself: apps should respond quickly, editing has more headroom, and supported games can render richer scenes." dark>
      <Lessons items={[
        { title: "For demanding apps", explanation: "Moving between camera, maps, work apps, and games should feel immediate. Extra processing headroom is especially useful when editing high-resolution photos or video on the phone." },
        { title: "Stays capable under load", explanation: "A redesigned vapor chamber helps move heat away from A20 Pro. That matters during long gaming or recording sessions, when a phone has to sustain performance rather than deliver one quick burst." },
        { title: "Efficiency counts too", explanation: "The same chip also manages power. Fast performance is more useful when it does not require constant charging; actual battery life will still vary with signal, brightness, and workload." },
      ]} />
    </Section>

    <Section id="camera" number="04" label="CAMERA" title="Know which camera to reach for." intro="Three rear cameras cover everyday scenes, wide spaces, and distant subjects. The Main camera's variable aperture can adjust how much light enters and how much of a scene stays in focus. You can leave it automatic or use Pro controls when you want more say." >
      <figure className="iphone-edu-figure iphone-edu-figure-camera"><div className="iphone-edu-camera-media"><img src="/products/story/iphone-18-pro-education-camera.jpg" alt="Illustrative close view of a burgundy rear camera system" loading="lazy" decoding="async" /></div><figcaption>Illustrative camera render; lens appearance may differ from the retail device.</figcaption></figure>
      <Lessons items={[
        { title: "Main: everyday and low light", explanation: "The 48MP Fusion Main is the default for people, food, streets, and changing light. Its variable aperture and image stabilization help balance detail, depth, and shake; Night mode helps when a scene is dim." },
        { title: "Ultra Wide: more in the frame", explanation: "The 48MP Ultra Wide is useful for interiors, group photos, and landscapes when stepping back is difficult. It also supports close-up macro photography for small details." },
        { title: "Telephoto: bring a subject closer", explanation: "The dedicated 48MP Telephoto provides 4x optical framing for portraits, performances, or subjects across a room. The phone also offers an 8x optical-quality option; digital zoom beyond that is less dependable for fine detail." },
        { title: "Portraits and creative control", explanation: "Portrait controls let you adjust focus and depth after capture. Photographic Styles shape the look of a photo, while Pro controls expose aperture, shutter speed, and white balance for more deliberate shooting." },
        { title: "Video that travels well", explanation: "The phone supports 4K Dolby Vision video, stabilization, and Cinematic mode. Creators can use ProRes and Apple Log workflows, but those formats take more storage and may need external recording for some settings." },
        { title: "The front camera matters too", explanation: "The 18MP Center Stage camera can help keep you framed for selfies and video calls. It also supports autofocus, portraits, and stabilized video." },
      ]} />
      <figure className="iphone-edu-figure iphone-edu-figure-finishes"><img src="/products/story/iphone-18-pro-supplied-four-finishes.jpg" alt="Illustrative rear views of iPhone 18 Pro in Black, Silver, Glacier, and Burgundy finishes" loading="lazy" decoding="async" /><figcaption>Illustrative finish lineup; check the exact listing for available colours and camera appearance.</figcaption></figure>
    </Section>

    <Section id="endurance" number="05" label="BATTERY & CHARGING" title="Power for a full working day." intro="Apple rates the iPhone 18 Pro for up to 24 hours of typical use and up to 36 hours of video playback under its test conditions. Treat these as guideposts, not a guarantee: navigation, 5G signal, camera use, and screen brightness all affect your day." dark>
      <Lessons items={[
        { title: "Plug in with USB-C", explanation: "USB-C handles charging and data. With a compatible 60W-capable adapter and cable, Apple says the battery can reach up to 50% in around 15 minutes; the adapter is sold separately." },
        { title: "Or use magnetic charging", explanation: "MagSafe aligns a compatible charger or accessory on the back. Apple rates MagSafe and Qi2 wireless charging up to 25W; the fastest MagSafe top-up needs a compatible charger and adapter." },
        { title: "Plan for your own routine", explanation: "A20 Pro's efficiency and the phone's battery management help stretch a charge. If you shoot long 4K videos or game for hours, expect to top up sooner than light-use estimates suggest." },
      ]} />
    </Section>

    <Section id="intelligence" number="06" label="SOFTWARE & INTELLIGENCE" title="Useful tools, not just a new chip." intro="iPhone 18 Pro ships with iOS 27. Apple Intelligence can help you work with text, find information, and edit photos, while keeping some processing on the device and using Private Cloud Compute for eligible requests." >
      <Lessons items={[
        { title: "Get through small tasks faster", explanation: "Writing and notification tools can help you summarize or rework information. Siri AI is rolling out in beta, so availability and results may vary by language, region, and software version." },
        { title: "Make a photo more usable", explanation: "Photos tools such as Clean Up and reframing can help refine a shot after you take it. They are editing aids, not a replacement for getting the original image right." },
        { title: "Works with your other Apple devices", explanation: "iCloud can keep selected photos and files available across devices, while features like AirDrop make sharing with nearby Apple hardware simpler. Some services need an Apple Account, internet access, or a subscription." },
      ]} />
    </Section>

    <Section id="connectivity" number="07" label="CONNECTIVITY & SAFETY" title="Stay connected. Keep control." intro="The phone supports 5G, Wi-Fi 7, Bluetooth 6, and USB-C. Faster standards are helpful when your network and accessories support them; your actual speeds depend on your carrier and surroundings." dark>
      <Lessons items={[
        { title: "Check the exact SIM model", explanation: "Apple lists eSIM support, but SIM configuration can vary by market. Before buying in Ghana, confirm the specific device model and eSIM or physical-SIM support with the seller and your carrier." },
        { title: "Privacy you can use", explanation: "Face ID helps unlock the phone and approve sensitive actions. App permissions let you decide which apps may access your camera, microphone, photos, and location." },
        { title: "Help in an emergency", explanation: "Crash Detection can help contact emergency services after a severe car crash. Satellite features exist on supported models, but availability varies by country, network, and service, so do not assume they work in Ghana." },
      ]} />
    </Section>

    <Section id="lifestyle" number="08" label="EVERYDAY EXPERIENCE" title="What will you actually notice?" intro="A smoother screen when you scroll, less waiting when you switch tasks, more choice when you frame a photo, and convenient ways to charge. Those are the day-to-day gains; you do not need to understand every specification to benefit from them." >
      <div className="iphone-edu-audience">
        <div><h3>Who it suits</h3><p>Choose the Pro if you regularly shoot photos or video, edit on your phone, play demanding games, or want a smaller Pro device with telephoto and manual camera options. It is also a meaningful upgrade for someone coming from a much older iPhone.</p></div>
        <div><h3>Who may not need it</h3><p>If you mainly message, browse, stream, and take casual photos, a less expensive iPhone may already cover your needs. The Pro camera and performance headroom are most valuable when you will actually use them.</p></div>
      </div>
    </Section>

    <section className="iphone-edu-finale" aria-labelledby="iphone-edu-finale-title">
      <div className="iphone-edu-inner"><span className="iphone-edu-index">ONE LAST LOOK</span><h2 id="iphone-edu-finale-title">Pro, from every angle.</h2>
        <figure className="iphone-edu-figure iphone-edu-figure-side"><img src="/products/story/iphone-18-pro-education-side.jpg" alt="Illustrative burgundy iPhone side profile" loading="lazy" decoding="async" /><figcaption>Illustrative side-profile render.</figcaption></figure>
      </div>
    </section>

    <section className="iphone-edu-before" id="before-you-buy" aria-labelledby="iphone-edu-before-title"><div className="iphone-edu-inner">
      <span className="iphone-edu-index">BEFORE YOU BUY</span><h2 id="iphone-edu-before-title">Choose the right one for you.</h2>
      <p>The iPhone 18 Pro is the 6.3-inch model, not the larger Pro Max. Check the exact storage, finish, SIM configuration, condition, warranty, and included accessories on the listing before you order. The images on this page are illustrative; the selected product listing is the source for the item you will receive.</p>
      <div className="iphone-edu-before-actions"><Link className="editorial-buy" to={buyPath}>View pricing</Link><a href="https://www.apple.com/iphone-18-pro/specs/" target="_blank" rel="noreferrer">Read Apple's full specifications</a></div>
    </div></section>
  </div>;
}
