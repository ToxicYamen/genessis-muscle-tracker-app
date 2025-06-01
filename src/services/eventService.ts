class EventService {
  private static instance: EventService;
  private events: EventTarget;

  private constructor() {
    this.events = new EventTarget();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public on(event: string, callback: EventListener) {
    this.events.addEventListener(event, callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventListener) {
    this.events.removeEventListener(event, callback);
  }

  public emit(event: string, data?: any) {
    this.events.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}

export const eventService = EventService.getInstance();
export const EVENTS = {
  HEIGHT_UPDATED: 'height-updated',
  WEIGHT_UPDATED: 'weight-updated',
  BODY_FAT_UPDATED: 'body-fat-updated',
};
