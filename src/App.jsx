import { createSignal, For, createResource, createMemo, createComputed } from 'solid-js';
import Globe from './Globe'
import logo from './assets/logo.svg'
import Countdown from './Countdown'

export default function App () {
  const fetchLaunchpad = async id =>  {
    return (await fetch(`https://api.spacexdata.com/v4/launchpads/${id}`)).json()
  }

  const fetchUpcomingLaunches = async () =>
    (await fetch(`https://api.spacexdata.com/v5/launches/upcoming`)).json()

  const [selectedLaunch, setSelectedLaunch] = createSignal()
  const [launches] = createResource((fetchUpcomingLaunches));
  const [launchpad] = createResource(createMemo(() => selectedLaunch()?.launchpad), fetchLaunchpad);



  const [filter, setFilter] = createSignal(true)

  const sorted = () => {
    if (launches.loading) return []
    return launches().sort((a, b) => a.date_unix > b.date_unix ? -1 : 1)?.[filter() ? 'reverse' : 'slice']()
  }

  return (
    <div class='relative flex w-full h-full select-none'>
      <div class=" text-white flex flex-col gap-12  bg-[#040d21] p-8 shrink-0" width="400px" >
        <img src={logo} class="w-96" alt="" />
        <div class="flex flex-col gap-4 p-4 rounded-md bg-[#1f155f]/80 overflow-y-auto scrollbar  h-full flex-grow custom-bg">
          <div className="flex">
            <h1 class="text-xs font-bold uppercase">upcomming launches</h1>
            <div class="ml-auto">
              <Switch>
                <Match when={filter()}>
                  <svg onClick={[setFilter, false]} xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </Match>
                <Match when={!filter()}>
                  <svg onClick={[setFilter, true]} xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </Match>
              </Switch>
            </div>
          </div>

          <For each={sorted()}>{(launch) => {
            return <div className={selectedLaunch() === launch && 'bg-black/20'} onClick={() => setSelectedLaunch(launch)} class="px-4 py-2 cursor-pointer rounded-xl flex items-center" >
              <div class="flex flex-col">
                <span class="font-bold">
                  {launch.name}
                </span>
                <Countdown date={launch.date_utc}></Countdown>
              </div>
              <Show when={selectedLaunch() === launch}>
                <span class="w-3 h-3 bg-black/20 rounded-full ml-auto">

                </span>
              </Show>
            </div>
          }
          }</For>
        </div>
      </div>
      <Globe launchpad={launchpad} class="" ></Globe>
    </div >
  )
}