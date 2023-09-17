#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EventSource, NSObject)

RCT_EXTERN_METHOD(connect:(NSString *)url options:(NSDictionary *)options)
RCT_EXTERN_METHOD(disconnect)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
